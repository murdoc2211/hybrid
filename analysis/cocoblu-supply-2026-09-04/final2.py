import pandas as pd, numpy as np
pd.set_option('display.width',330)
m=pd.read_pickle('m.pkl'); pe=pd.read_pickle('po_exp.pkl')
for c in ['Remaining quantity','Cost']: pe[c]=pd.to_numeric(pe[c],errors='coerce').fillna(0)
op=pe[pe['Remaining quantity']>0]
df=m.drop(columns=['open_po']).join([
    op.groupby('ASIN')['Remaining quantity'].sum().rename('open_po'),
    pe.groupby('ASIN')['Cost'].last().rename('cost'),
    op[op['PO']=='1T5I9HTI'].groupby('ASIN')['Remaining quantity'].sum().rename('newpo'),
    op.groupby('ASIN')['Order date'].min().rename('oldest_open'),
    op.groupby('ASIN')['PO'].apply(lambda s:', '.join(sorted(set(s)))).rename('open_pos')],how='outer')
for c in ['sellable','drr_sep','gvs','open_po','newpo']: df[c]=df[c].fillna(0)
df=df[df.index.notna()&(df.index!='-')]
# names
nm=pe.groupby('ASIN')['Product name'].first(); sk=pe.groupby('ASIN')['Model number'].first()
df['name']=df['name'].fillna(nm.reindex(df.index)).fillna(pd.Series('(ASIN '+df.index.astype(str)+')',index=df.index))
df['sku']=df['sku'].fillna(sk.reindex(df.index))
df['name']=df['name'].str.slice(0,60)
df['doh_now']=np.where(df['drr_sep']>0,df['sellable']/df['drr_sep'],np.inf)

# --- classify ---
# OOS/starved: little or no stock but proven demand signal (glance views) or an open PO placed by Amazon
df['oos']= (df['sellable']<=15) & (df['open_po']>0)
def tgt(d):
    if d>=10: return 45
    if d>=2: return 40
    if d>0: return 30
    return 0
df['cover_tgt']=df['drr_sep'].map(tgt)
df['need_units']=(df['drr_sep']*df['cover_tgt']-df['sellable']).clip(lower=0).round()
# seed for OOS / new launches with no reliable DRR: proxy demand from glance views (assume ~2.5% cvr) floor 30
seed=np.maximum(30,(df['gvs']/3*0.025*40).round())   # gvs is 3-day; daily gv * 2.5% cvr * 40d cover
df['need_units']=np.where((df['drr_sep']<0.5)&(df['open_po']>0), np.minimum(seed,df['open_po']), df['need_units'])
df['need_units']=np.where(df['newpo']>0, np.maximum(df['need_units'],df['newpo']), df['need_units'])
df['ship_now']=np.minimum(df['need_units'],df['open_po'])
df['gap_no_po']=(df['need_units']-df['open_po']).clip(lower=0)
df['hold_po']=(df['open_po']-df['ship_now']).clip(lower=0)
df['ship_val']=(df['ship_now']*df['cost']).round(0)
df['doh_after']=np.where(df['drr_sep']>0,((df['sellable']+df['ship_now'])/df['drr_sep']).round(0),np.nan)

def band(r):
    if r['newpo']>0: return 'P0-NewLaunch'
    if r['oos'] and r['gvs']>0: return 'P0-OOS'
    if r['drr_sep']==0: return 'P4-Dead'
    if r['doh_now']<15: return 'P1-Critical'
    if r['doh_now']<25: return 'P2-Watch'
    if r['doh_now']<=60: return 'P3-Healthy'
    return 'P5-Overstock'
df['tier']=df.apply(band,axis=1)
df['drr_sep']=df['drr_sep'].round(1); df['doh_now']=df['doh_now'].replace(np.inf,9999).round(0)
df=df.sort_values(['tier','ship_val'],ascending=[True,False])
cols=['name','sku','sellable','drr_sep','doh_now','gvs','need_units','open_po','ship_now','doh_after','gap_no_po','hold_po','ship_val','open_pos','oldest_open','tier']
o=df[cols]
for t in sorted(df.tier.unique()):
    s=o[o.tier==t]
    s=s[(s.ship_now>0)|(s.hold_po>0)|(s.gap_no_po>0)|(s.drr_sep>0)]
    if len(s)==0: continue
    print('\n### '+t, f"ship {int(s.ship_now.sum())} u / Rs {s.ship_val.sum():,.0f}")
    print(s.drop(columns=['sku','open_pos','tier','oldest_open']).to_string(max_colwidth=52))
print('\nGRAND: sellable',int(df.sellable.sum()),'| openPO',int(df.open_po.sum()),'| SHIP',int(df.ship_now.sum()),'| Rs',f"{df.ship_val.sum():,.0f}",'| HOLD',int(df.hold_po.sum()),'| GAP(need new PO)',int(df.gap_no_po.sum()))
df.to_pickle('df.pkl')
