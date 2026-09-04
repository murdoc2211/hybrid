import pandas as pd
X='/root/.claude/uploads/33e36581-ad8c-550e-954b-50c2cc982611/'
xlsx=X+'59cab6dd-Sales_Inv_Open_PO_Stuffcool_04Sep2026.xlsx'
sale=pd.read_excel(xlsx,'sale'); inv=pd.read_excel(xlsx,'inv'); po=pd.read_excel(xlsx,'po'); gv=pd.read_excel(xlsx,'gv')
pd.set_option('display.width',250)

print('--- INV dispositions ---')
print(inv.groupby('disposition')['qty'].sum())
print('inv_date', inv['inv_date'].unique())

sellable=inv[inv['disposition'].str.upper()=='SELLABLE'].groupby('asin')['qty'].sum().rename('sellable')
print('total sellable',sellable.sum(),'asins',len(sellable))

# sales
daycols=[c for c in sale.columns if str(c).startswith('2026-')]
print('day cols',daycols)
sale['sold']=sale[daycols].fillna(0).sum(axis=1)
s=sale.set_index('asin')
drr=(s['sold']/len(daycols)).rename('drr_sep')

# open po
po['Open PO']=pd.to_numeric(po['Open PO'],errors='coerce').fillna(0)
openpo=po.groupby('isbn')['Open PO'].sum().rename('open_po')

names=pd.concat([s['item_description'].rename('name'),po.set_index('isbn')['item_name'].rename('name')])
names=names[~names.index.duplicated()].dropna()

m=pd.concat([sellable,drr,openpo],axis=1).fillna(0)
m['name']=names.reindex(m.index)
gvs=gv.groupby('asin')['gvs'].sum().rename('gvs')
m['gvs']=gvs.reindex(m.index).fillna(0)
m['doh']=(m['sellable']/m['drr_sep']).round(1)
m=m.sort_values('drr_sep',ascending=False)
act=m[(m['drr_sep']>0)|(m['open_po']>0)|(m['gvs']>50)]
print(act[['name','sellable','drr_sep','doh','open_po','gvs']].head(60).to_string(max_colwidth=55))
m.to_pickle('m.pkl'); sale.to_pickle('sale.pkl')
