import pandas as pd
m=pd.read_pickle('m.pkl'); pe=pd.read_pickle('po_exp.pkl')
n2=pe.groupby('ASIN')['Product name'].first()
sku=pe.groupby('ASIN')['Model number'].first()
m['name']=m['name'].fillna(n2.reindex(m.index))
m['sku']=sku.reindex(m.index)
miss=m[m['name'].isna()&((m['sellable']>0)|(m['drr_sep']>0))]
print('still missing:'); print(miss[['sellable','drr_sep','gvs']].to_string())
m.to_pickle('m.pkl')
