"""Build the Cocoblu supply file in the format Dhaval's team uses:
the raw Amazon PO Item Export with a single 'Supply' column inserted after
'Remaining quantity', PO-line level, sorted by remaining qty descending,
supply rows only, and SUMPRODUCT(Supply, Cost) in row 1 above column R."""
import pandas as pd, numpy as np, xlrd, datetime, openpyxl
from openpyxl.utils import get_column_letter

SRC='/root/.claude/uploads/33e36581-ad8c-550e-954b-50c2cc982611/591a9c00-POItemExport_20260904.xls'
OUT='/home/user/hybrid/analysis/cocoblu-supply-2026-09-04/Cocoblu_supply_04_Sep.xlsx'
df=pd.read_pickle('v7df.pkl')          # per-ASIN plan from v9.py

# --- read the export back in raw form, keeping Excel serial dates as-is ---
wb=xlrd.open_workbook(SRC); sh=wb.sheet_by_name('Line Items')
hdr=sh.row_values(0)
raw=pd.DataFrame([sh.row_values(r) for r in range(1,sh.nrows)],columns=hdr)
for c in ['Requested quantity','Accepted quantity','ASN quantity','Received quantity',
          'Cancelled quantity','Remaining quantity','Cost','Case size']:
    raw[c]=pd.to_numeric(raw[c],errors='coerce').fillna(0)

# --- same scope the plan was built on: QZ73J / ISK3 / live POs / open lines ---
def serial_to_date(v):
    return xlrd.xldate.xldate_as_datetime(float(v),wb.datemode).date()
raw['_we']=raw['Window end'].map(serial_to_date)
live=raw.groupby('PO')['_we'].max()
live=set(live[live>=datetime.date(2026,9,4)].index)
m=raw[(raw['Vendor code']=='QZ73J')&(raw['Ship-to location']=='ISK3')
      &(raw['PO'].isin(live))&(raw['Remaining quantity']>0)].copy()

# --- allocate each ASIN's planned ship across its PO lines, oldest PO first ---
m=m.sort_values(['Order date','PO'])
m['Supply']=0
for asin,g in m.groupby('ASIN',sort=False):
    left=float(df.loc[asin,'ship']) if asin in df.index else 0.0
    for i,r in g.iterrows():
        q=min(left,r['Remaining quantity']); m.at[i,'Supply']=int(round(q)); left-=q

out=m[m.Supply>0].drop(columns=['_we']).sort_values('Remaining quantity',ascending=False)
cols=list(hdr); cols.insert(cols.index('Remaining quantity')+1,'Supply')
out=out[cols]

wbo=openpyxl.Workbook(); ws=wbo.active; ws.title='Sheet1'
ws.cell(row=1,column=hdr.index('Remaining quantity')+1,
        value=float((out.Supply*out.Cost).sum()))          # total supply value, col R
for j,c in enumerate(cols,1): ws.cell(row=2,column=j,value=c)
for i,(_,r) in enumerate(out.iterrows(),3):
    for j,c in enumerate(cols,1):
        v=r[c]
        ws.cell(row=i,column=j,value=int(v) if isinstance(v,float) and v==int(v) and c not in('Cost',) else v)
for j,c in enumerate(cols,1):
    ws.column_dimensions[get_column_letter(j)].width=min(max(len(str(c))+2,10),46)
wbo.save(OUT)
print('units',int(out.Supply.sum()),'| value %.1f'%(out.Supply*out.Cost).sum(),'| lines',len(out))
print(out[['PO','Model number','Remaining quantity','Supply','Cost']].to_string(index=False))
