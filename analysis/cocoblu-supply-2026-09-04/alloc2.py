import pandas as pd, numpy as np
df=pd.read_pickle('df.pkl'); pe=pd.read_pickle('po_exp.pkl')
pe['Remaining quantity']=pd.to_numeric(pe['Remaining quantity'],errors='coerce').fillna(0)
op=pe[pe['Remaining quantity']>0].copy().sort_values(['Order date','PO'])

rows=[]
for asin,g in op.groupby('ASIN',sort=False):
    target=float(df.loc[asin,'ship_now']) if asin in df.index else 0.0
    tier=df.loc[asin,'tier'] if asin in df.index else 'NA'
    # regional seeding: for OOS/launch SKUs, fill non-ISK3 (satellite FC) lines in full first
    g=g.copy()
    g['_pri']=np.where((tier.startswith('P0')) & (g['Ship-to location']!='ISK3'),0,1)
    g=g.sort_values(['_pri','Order date'])
    if tier.startswith('P0'):
        sat=g.loc[g._pri==0,'Remaining quantity'].sum()
        target=max(target, min(g['Remaining quantity'].sum(), target+sat))
    left=target
    for _,r in g.iterrows():
        q=min(left,r['Remaining quantity']); left-=q
        rows.append(dict(Tier=tier,PO=r['PO'],Order_date=r['Order date'].date(),FC=r['Ship-to location'],
          ASIN=asin,SKU=r['Model number'],Product=str(r['Product name'])[:95],Cost=r['Cost'],
          Open_qty=int(r['Remaining quantity']),SHIP_NOW=int(round(q)),Hold=int(r['Remaining quantity']-round(q)),
          Window_start=r['Window start'].date(),Window_end=r['Window end'].date(),
          Cancel_by=r['Cancellation deadline'].date() if pd.notna(r['Cancellation deadline']) else None))
a=pd.DataFrame(rows)
a['Ship_value']=(a.SHIP_NOW*a.Cost).round(0)
a=a.sort_values(['Tier','Ship_value'],ascending=[True,False])
print(a[a.SHIP_NOW>0].groupby(['FC','PO','Order_date'])[['SHIP_NOW','Ship_value']].sum().sort_values('SHIP_NOW',ascending=False).to_string())
print('\nTOTAL SHIP',a.SHIP_NOW.sum(),'Rs',f"{a.Ship_value.sum():,.0f}",'| HOLD',a.Hold.sum())
print(a.groupby('Tier')[['SHIP_NOW','Ship_value','Hold']].sum().to_string())
a.to_pickle('alloc.pkl')
