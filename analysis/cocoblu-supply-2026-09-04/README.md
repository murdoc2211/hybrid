# Cocoblu (Amazon Vendor) Supply Plan — 4 Sep 2026

Urgent dispatch plan against open Amazon POs for Stuffcool, built from the
Vendor Central PO Item Export and the Sales/Inventory/Open-PO workbook.

## v4 (current) - expired POs removed

`Cocoblu_Supply_Plan_v4_ISK3.xlsx` - built by `v7.py -> x4.py`

- Vendor code **QZ73J**, ship-to **ISK3** only.
- **POs whose delivery window has closed are dropped from the supply pool.**
  As of 4 Sep that is 39VRVKCF (1,105u, window closed 1 Sep). Demand it was
  covering reallocates onto still-open POs for the same ASINs; whatever cannot
  be covered flows into the "ask Amazon" gap list rather than being planned
  against a dead PO.
- **35-day cover cap binds established SKUs only.** New arrivals have no DRR
  to cap against, so they ship Amazon's full accepted quantity.
- Superseded incumbents (old GIGA, Click Slim) bridged to 15 days.
  Quad Pro Max is live and coexists with Quad Pro Black - normal 35d cap.
- Residual lines of 20u or fewer on zero-stock SKUs ship in full to close the
  PO line; immaterial quantities, and it protects fill rate.
- No supply available (excluded): Click 20000, Quad Pro 1.5m 60W,
  Quad Pro Black 1.5m.

Result: ship 4,200u / Rs 74.1L across 6 live POs, hold 8,595u, ask Amazon for 604u.

## v3 (superseded) - expired PO still in the pool - 35d cap on established SKUs only, ISK3

`Cocoblu_Supply_Plan_v3_ISK3.xlsx` - built by `v2.py -> v6.py -> x3.py`

- Vendor code **QZ73J**, ship-to **ISK3** only. PPAFS lines (147u across
  HBA4/HKA2/HNR4/HPN6) excluded.
- **35-day cover cap binds established SKUs only.** A new arrival has no DRR
  to cap against, so it ships Amazon's full accepted quantity.
  - Group A - on the new PO 1T5I9HTI (1,200u)
  - Group B - never sold, at or under 15u on hand, recent ASIN (512u)
- Incumbents of a **superseded** franchise (old GIGA, Click Slim) are bridged
  to 15 days only, so they run down as the successor lands. This trims the old
  SKU, never the new arrival.
- Quad Pro Max is **not** superseded by Quad Pro Black - 240W/1.5m vs 100W/1.2m
  are different spec tiers that coexist, both live. Max takes the normal 35d
  cap (ships 60), not a run-down.
- No supply available (excluded): Click 20000, Quad Pro 1.5m 60W,
  Quad Pro Black 1.5m.

Result: ship 4,281u / Rs 74.7L, hold 9,619u, ask Amazon for 559u not on any PO.
Franchise DOH after landing: GIGA 41d, Click 48d, Quad Pro 60d - the cost of
uncapping new arrivals, shown in sheet `4_Franchise cap` rather than capped away.

## v2 (superseded) - 35-day cap on everything - 35-day cap, ISK3 only

`Cocoblu_Supply_Plan_v2_35day_ISK3.xlsx` - built by `v2.py -> v4.py -> v5.py -> x2.py`

Constraints applied:

- Vendor code **QZ73J**, ship-to **ISK3** only. PPAFS lines (147u across HBA4/HKA2/HNR4/HPN6) excluded.
- Hard **35-day** cover cap on Sept DRR. No SKU ends above cover after shipping.
- No supply available (excluded): Click 20000, Quad Pro 1.5m 60W, Quad Pro Black 1.5m.
- **Franchise netting**: a new launch shares a demand pool with the SKU it replaces,
  so GIGA/GIGA II, Click Slim/Click+, and Quad Pro Max/Quad Pro Black are capped
  together. Incumbent is bridged at 15 days through changeover, successor takes the
  remainder of the franchise budget.

Result: ship 3,280u / Rs 61.5L, hold 10,620u, ask Amazon for 559u not on any PO.

## v1 output (superseded - 45d cover, all FCs)

`Cocoblu_Supply_Plan_04Sep2026.xlsx`

| Sheet | Contents |
|---|---|
| 0_Summary | Account-level position and totals |
| 1_Dispatch by PO | Ship quantity and value per PO / FC |
| 2_Dispatch lines | PO-line level ship list (hand to warehouse) |
| 3_SKU plan | Per-ASIN: sellable, DRR, DOH, cover target, ship / hold / gap |
| 4_PO gap - ask Amazon | Units needed that no open PO covers |
| 5_Hold or cancel | Open PO against overstocked or dead SKUs |
| 6_Sellable inv pivot | Sellable-only inventory by ASIN x age bucket |

## Method

- Inventory filtered to `disposition = SELLABLE` only, pivoted by ASIN.
- DRR from the 3-day sales window (1-3 Sep). Cross-checks against the Aug DRR
  in Mansi's low-DOH working, so the base is holding.
- Cover targets by velocity band: DRR >= 10 -> 45d, 2-10 -> 40d, >0 -> 30d.
- SKUs with no sales but stock at or below 15 units are treated as
  out-of-stock (starved), not dead. Seeded off glance views, not DRR.
- Ship qty = min(need, open PO), allocated back to PO lines oldest-first.
  Out-of-stock SKUs fill satellite-FC lines first for national seeding.

## Reproduce

Requires `pandas`, `openpyxl`, `xlrd`. Point the input paths in `load.py` and
`core.py` at the source files, then run in order:

    python3 load.py && python3 core.py && python3 names.py
    python3 final2.py && python3 alloc2.py && python3 xl.py

Input files are not committed (vendor data).
