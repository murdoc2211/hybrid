import pandas as pd, xlrd, datetime
X='/root/.claude/uploads/33e36581-ad8c-550e-954b-50c2cc982611/'
xls=X+'591a9c00-POItemExport_20260904.xls'
xlsx=X+'59cab6dd-Sales_Inv_Open_PO_Stuffcool_04Sep2026.xlsx'

wb=xlrd.open_workbook(xls)
sh=wb.sheet_by_name('Line Items')
hdr=sh.row_values(0)
rows=[sh.row_values(r) for r in range(1,sh.nrows)]
po_exp=pd.DataFrame(rows,columns=hdr)
def d(v):
    try: return xlrd.xldate.xldate_as_datetime(float(v),wb.datemode)
    except: return pd.NaT
for c in ['Order date','Window start','Window end','Expected date','Cancellation deadline']:
    po_exp[c]=po_exp[c].map(d)
po_exp.to_pickle('po_exp.pkl')
print(po_exp['Status'].value_counts())
print(po_exp['Order date'].min(),po_exp['Order date'].max())
print(po_exp.groupby([po_exp['Order date'].dt.date,'PO'])['Remaining quantity'].sum().tail(30))
