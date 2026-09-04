import pandas as pd, numpy as np
pd.set_option('display.width',330)
df=pd.read_pickle('v4df.pkl'); COVER=35
# hard rule: any SKU with a real DRR must not exceed COVER after shipping
capped=np.where(df.drr_sep>0,(df.drr_sep*COVER-df.sellable).clip(lower=0).round(),df.ship)
df['ship']=np.minimum(df.ship,capped)
df['doh_after']=np.where(df.drr_sep>0,((df.sellable+df.ship)/df.drr_sep).round(1),np.nan)
df['hold']=(df.open_po-df.ship).clip(lower=0); df['ship_val']=(df.ship*df.cost).round(0)
bad=df[(df.ship>0)&(df.doh_after>COVER+0.5)]
print('SKUs shipped above 35 DOH:',len(bad))
print('\nSHIP',int(df.ship.sum()),'u | Rs',f"{df.ship_val.sum():,.0f}",'| HOLD',int(df.hold.sum()),'| GAP',int(df.gap.sum()))
sh=df[df.ship>0]
print('shipped SKUs:',len(sh),'| max DOH after among shipped:',sh.doh_after.max())
df.to_pickle('v5df.pkl')
