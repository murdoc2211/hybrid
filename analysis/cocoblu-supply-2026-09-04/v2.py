import pandas as pd, numpy as np
pd.set_option('display.width',330)
m=pd.read_pickle('m.pkl'); pe=pd.read_pickle('po_exp.pkl')
for c in ['Remaining quantity','Cost']: pe[c]=pd.to_numeric(pe[c],errors='coerce').fillna(0)

# ---- CONSTRAINT 1: QZ73J vendor code, ISK3 only ----
pe=pe[(pe['Vendor code']=='QZ73J')&(pe['Ship-to location']=='ISK3')]
op=pe[pe['Remaining quantity']>0]

# ---- CONSTRAINT 2: no supply available (sold out at our end) ----
SOLDOUT={'B0DFZ1KDPL':'Click 20000 Magnetic','B0C1H6N3FX':'Quad Pro 4-in-1 1.5m 60W (old)',
         'B0DSFKRMDM':'Quad Pro Black 1.5m (old)'}
COVER=35   # ---- CONSTRAINT 3: hard 35-day cover on Sept DRR ----

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
df['doh_now']=np.where(df['drr_sep']>0,df['sellable']/df['drr_sep'],np.inf)

# ---- need @ 35d ; hard zero if already at/над cover ----
df['need']=np.where(df['drr_sep']>0,(df['drr_sep']*COVER-df['sellable']).round(),0.0).clip(0)
# starved SKUs only (<=15 units on hand): seed off glance views, capped at 30
starved=(df['drr_sep']<0.5)&(df['sellable']<=15)&(df['open_po']>0)
df['need']=np.where(starved,np.minimum(30,df['open_po']),df['need'])
df['soldout']=df.index.isin(SOLDOUT)
df.loc[df.soldout,'need']=0
df['raw_ship']=np.minimum(df['need'],df['open_po'])
# new launch: Amazon's confirmed launch qty, before franchise netting
df['raw_ship']=np.where((df.newpo>0)&(~df.soldout),df['newpo'],df['raw_ship'])
df.to_pickle('v2df.pkl')
print('QZ73J/ISK3 open PO:',int(df.open_po.sum()),'| uncapped ship @35d:',int(df.raw_ship.sum()))
print('\nsold-out excluded:',{k:int(df.loc[k,'open_po']) for k in SOLDOUT if k in df.index})
