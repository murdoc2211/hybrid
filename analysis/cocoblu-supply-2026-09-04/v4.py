import pandas as pd, numpy as np
pd.set_option('display.width',330)
df=pd.read_pickle('v2df.pkl'); COVER=35; BRIDGE=15
FR={'GIGA 20000':(['B0DMDZF5SV'],['B0HFJGKC8H']),
    'Click 10000 magnetic':(['B0DFZ3FK9F'],['B0HGB1DJKY','B0HGB1T2S7','B0CG668622']),
    'Quad Pro cable':(['B0D8443PTW'],['B0H71NCHP7'])}
df['franchise']=''; df['ship']=df['raw_ship']
rep=[]
for f,(old,new) in FR.items():
    mem=[x for x in old+new if x in df.index]
    for x in mem: df.loc[x,'franchise']=f
    fdrr=df.loc[mem,'drr_sep'].sum(); fstock=df.loc[mem,'sellable'].sum()
    room=max(0.0,fdrr*COVER-fstock)
    left=room
    # 1) bridge the incumbent at BRIDGE days so it doesn't go OOS mid-changeover
    for x in old:
        q=min(left,max(0.0,df.loc[x,'drr_sep']*BRIDGE-df.loc[x,'sellable']),df.loc[x,'open_po'])
        df.loc[x,'ship']=round(q); left-=q
    # 2) successor takes the remainder, split pro-rata across colours
    ask=sum(df.loc[x,'raw_ship'] for x in new)
    for x in new:
        q=min(df.loc[x,'raw_ship'], left*(df.loc[x,'raw_ship']/ask) if ask else 0)
        df.loc[x,'ship']=round(q)
    rep.append([f,round(fdrr,1),int(fstock),int(fdrr*COVER),int(room),int(df.loc[mem,'raw_ship'].sum()),int(df.loc[mem,'ship'].sum())])
print(pd.DataFrame(rep,columns=['Franchise','DRR','Stock now','35d cap','Room','Amazon asks','SHIP']).to_string(index=False))
print()
for f,(old,new) in FR.items():
    for x in old+new:
        if x in df.index:
            r=df.loc[x]
            print(f"  {'OLD' if x in old else 'NEW'} {r['name'][:44]:46} stock {int(r.sellable):5} drr {r.drr_sep:5.1f} openPO {int(r.open_po):5} -> ship {int(r.ship):4}")
df['doh_after']=np.where(df.drr_sep>0,((df.sellable+df.ship)/df.drr_sep).round(0),np.nan)
df['hold']=(df.open_po-df.ship).clip(lower=0); df['gap']=np.where(df.soldout,0,(df['need']-df.open_po).clip(lower=0))
df['ship_val']=(df.ship*df.cost).round(0)
print('\nSHIP',int(df.ship.sum()),'u | Rs',f"{df.ship_val.sum():,.0f}",'| HOLD',int(df.hold.sum()),'| GAP',int(df.gap.sum()))
print('Account DOH',round(df.sellable.sum()/df.drr_sep.sum(),1),'-> after',round((df.sellable.sum()+df.ship.sum())/df.drr_sep.sum(),1))
print('max SKU DOH after ship (excl. no-DRR):',df.doh_after.max())
df.to_pickle('v4df.pkl')
