import pandas as pd, numpy as np, datetime
pd.set_option('display.width',330)
TODAY=datetime.date(2026,9,4); COVER=35; BRIDGE=15
m=pd.read_pickle('m.pkl'); pe=pd.read_pickle('po_exp.pkl')
for c in ['Remaining quantity','Cost']: pe[c]=pd.to_numeric(pe[c],errors='coerce').fillna(0)
pe=pe[(pe['Vendor code']=='QZ73J')&(pe['Ship-to location']=='ISK3')]

# ---- drop POs whose delivery window has already closed ----
we=pe.groupby('PO')['Window end'].max()
expired=sorted(we[we.dt.date<TODAY].index)
print('EXPIRED POs removed:',expired)
exp_units=int(pe[pe.PO.isin(expired)]['Remaining quantity'].sum())
exp_val=float((pe[pe.PO.isin(expired)]['Remaining quantity']*pe[pe.PO.isin(expired)]['Cost']).sum())
print(f'  units removed from supply pool: {exp_units}  (Rs {exp_val:,.0f} at cost)')
pe=pe[~pe.PO.isin(expired)]
op=pe[pe['Remaining quantity']>0]

SOLDOUT={'B0DFZ1KDPL','B0C1H6N3FX','B0DSFKRMDM'}
df=m.drop(columns=['open_po']).join([
    op.groupby('ASIN')['Remaining quantity'].sum().rename('open_po'),
    pe.groupby('ASIN')['Cost'].last().rename('cost'),
    op[op['PO']=='1T5I9HTI'].groupby('ASIN')['Remaining quantity'].sum().rename('newpo'),
    op.groupby('ASIN')['PO'].apply(lambda s:', '.join(sorted(set(s)))).rename('open_pos')],how='outer')
for c in ['sellable','drr_sep','gvs','open_po','newpo']: df[c]=df[c].fillna(0)
df=df[df.index.notna()&(df.index!='-')]
nm=pe.groupby('ASIN')['Product name'].first(); sk=pe.groupby('ASIN')['Model number'].first()
df['name']=df['name'].fillna(nm.reindex(df.index)).fillna(pd.Series('(ASIN '+df.index.astype(str)+')',index=df.index)).str.slice(0,58)
df['sku']=df['sku'].fillna(sk.reindex(df.index))
df['soldout']=df.index.isin(SOLDOUT)
df['doh_now']=np.where(df['drr_sep']>0,df['sellable']/df['drr_sep'],np.inf)
df['need']=np.where(df['drr_sep']>0,(df['drr_sep']*COVER-df['sellable']).round(),0.0).clip(0)

newA=df.newpo>0
recent=df.index.to_series().str.match(r'B0(F|G|H)')
newB=(~newA)&(df.drr_sep==0)&(df.sellable<=15)&(df.open_po>0)&recent
df['arrival']=np.where(newA,'A-new PO',np.where(newB,'B-never sold (recent)',''))
df['need']=np.where(newA|newB,df.open_po,df['need'])
df['ship']=np.minimum(df['need'],df['open_po'])
est=(~newA)&(~newB)&(df.drr_sep>0)
df.loc[est,'ship']=np.minimum(df.loc[est,'open_po'],(df.loc[est,'drr_sep']*COVER-df.loc[est,'sellable']).clip(lower=0).round())
df['franchise']=''
for x,f in {'B0DMDZF5SV':'GIGA 20000','B0DFZ3FK9F':'Click 10000 magnetic'}.items():
    df.loc[x,'franchise']=f
    df.loc[x,'need']=max(0.0,round(df.loc[x,'drr_sep']*BRIDGE-df.loc[x,'sellable']))
    df.loc[x,'ship']=min(df.loc[x,'open_po'],df.loc[x,'need'])
# trivial residual lines (<=20u, zero stock): ship to close the PO line - no overstock risk at this size
triv=(df.ship==0)&(df.open_po>0)&(df.open_po<=20)&(df.sellable<=15)&(~df.soldout)
df.loc[triv,'ship']=df.loc[triv,'open_po']
df.loc[df.soldout,['need','ship']]=0
df['doh_after']=np.where(df.drr_sep>0,((df.sellable+df.ship)/df.drr_sep).round(1),np.nan)
df['hold']=(df.open_po-df.ship).clip(lower=0)
df['gap']=np.where(df.soldout,0,(df['need']-df.open_po).clip(lower=0))
df['ship_val']=(df.ship*df.cost).round(0); df['gap_val']=(df['gap']*df.cost.fillna(0)).round(0)
print('\nSHIP',int(df.ship.sum()),'u | Rs',f"{df.ship_val.sum():,.0f}",'| HOLD',int(df.hold.sum()),'| GAP',int(df.gap.sum()),'Rs',f"{df.gap_val.sum():,.0f}")
print('\nGAP grew because of the expired PO - top asks:')
print(df[df.gap>0].sort_values('gap',ascending=False)[['name','sellable','drr_sep','doh_now','need','open_po','gap','gap_val']].head(14).to_string(max_colwidth=44))
df.to_pickle('v7df.pkl')
