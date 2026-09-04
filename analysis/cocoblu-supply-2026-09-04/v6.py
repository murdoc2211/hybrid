import pandas as pd, numpy as np
pd.set_option('display.width',330)
df=pd.read_pickle('v2df.pkl'); COVER=35; BRIDGE=15
# --- new arrivals: no cover cap, ship Amazon's full ask ---
# group A = on the new PO 1T5I9HTI ; group B = never sold, starved, recent ASIN
newA=df.newpo>0
recent=df.index.to_series().str.match(r'B0(F|G|H)')
newB=(~newA)&(df.drr_sep==0)&(df.sellable<=15)&(df.open_po>0)&recent
df['arrival']=np.where(newA,'A-new PO',np.where(newB,'B-never sold (recent)',''))
df['ship']=np.where(newA|newB, df.open_po, np.minimum(df['need'],df.open_po))
df.loc[df.soldout,'ship']=0

# --- established SKUs: hard 35d cap stays ---
est=(~newA)&(~newB)&(df.drr_sep>0)
df.loc[est,'ship']=np.minimum(df.loc[est,'open_po'],(df.loc[est,'drr_sep']*COVER-df.loc[est,'sellable']).clip(lower=0).round())
# incumbents of a superseded franchise: bridge only to BRIDGE days, let them run down
# Quad Pro Max is live and NOT superseded by Quad Pro Black (240W/1.5m vs 100W/1.2m,
# different spec tiers that coexist) - it takes the normal 35d cap, no run-down.
INC={'B0DMDZF5SV':'GIGA 20000','B0DFZ3FK9F':'Click 10000 magnetic'}
for x,f in INC.items():
    df.loc[x,'ship']=min(df.loc[x,'open_po'],max(0.0,round(df.loc[x,'drr_sep']*BRIDGE-df.loc[x,'sellable'])))
    df.loc[x,'franchise']=f
df.loc[df.soldout,'ship']=0
df['doh_after']=np.where(df.drr_sep>0,((df.sellable+df.ship)/df.drr_sep).round(1),np.nan)
df['hold']=(df.open_po-df.ship).clip(lower=0)
df['gap']=np.where(df.soldout,0,(df['need']-df.open_po).clip(lower=0))
df['ship_val']=(df.ship*df.cost).round(0)
print('NEW ARRIVALS (uncapped, full ask)')
n=df[df.arrival!=''].sort_values(['arrival','ship_val'],ascending=[True,False])
print(n[['name','arrival','sellable','open_po','ship','cost','ship_val']].to_string(max_colwidth=46))
print('\n  group A',int(df[newA].ship.sum()),'u / Rs',f"{df[newA].ship_val.sum():,.0f}",'| group B',int(df[newB].ship.sum()),'u / Rs',f"{df[newB].ship_val.sum():,.0f}")
print('\nFRANCHISE CHECK (old + new combined, post-ship)')
for f in ['GIGA 20000','Click 10000 magnetic','Quad Pro cable']:
    g=df[df.franchise==f] if (df.franchise==f).any() else None
FR={'GIGA 20000':['B0DMDZF5SV','B0HFJGKC8H'],'Click 10000 magnetic':['B0DFZ3FK9F','B0HGB1DJKY','B0HGB1T2S7','B0CG668622'],'Quad Pro cables (coexist)':['B0D8443PTW','B0H71NCHP7']}
for f,mem in FR.items():
    mem=[x for x in mem if x in df.index]; g=df.loc[mem]
    print(f"  {f:24} drr {g.drr_sep.sum():5.1f} | stock {int(g.sellable.sum()):5} + ship {int(g.ship.sum()):5} = {int(g.sellable.sum()+g.ship.sum()):5} -> {(g.sellable.sum()+g.ship.sum())/g.drr_sep.sum():5.0f} days")
est_sh=df[est&(df.ship>0)]
print('\nESTABLISHED SKUs max DOH after ship:',est_sh.doh_after.max())
print('SHIP',int(df.ship.sum()),'u | Rs',f"{df.ship_val.sum():,.0f}",'| HOLD',int(df.hold.sum()),'| GAP',int(df.gap.sum()))
df.to_pickle('v6df.pkl')
