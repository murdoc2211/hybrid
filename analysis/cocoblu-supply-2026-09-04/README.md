# Cocoblu (Amazon Vendor) Supply Plan — 4 Sep 2026

Urgent dispatch plan against open Amazon POs for Stuffcool, built from the
Vendor Central PO Item Export and the Sales/Inventory/Open-PO workbook.

## Output

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
