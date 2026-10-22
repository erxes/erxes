---
name: report
description: Report playbook with the what-if chart contract the app renders. Load before creating, showing or revising a report in any language.
---

# Report

A report is one HTML deliverable sent through `createArtifact` with type `html`. Questions about an existing report get an ordinary reply, not a new report.

## Steps

1. **Fetch the numbers.** Use verified workspace data for every metric, comparison and grouped breakdown. Show the period, units, currency, filters and any missing or partial data in a few words. When there is no numeric evidence, say so and skip the quantitative chart; a hypothetical model is fine only when its assumptions come from the user's request and are labeled as assumptions.
2. **Lead with the finding.** Open with the main finding and its essential numbers, then short labels or one-sentence explanations. Each fact appears once: in the chart, the table or the prose.
3. **Add at least one what-if chart** that follows the contract below, with a plain-language note beside it saying which factors are held constant and what the model leaves out. Keep observed data visibly separate from projections.
4. **Place references** at the data points they describe (next to the record name, table row, ranked item or metric), using only server-issued `[[ref:<handle>]]` tokens from workspace tools.
5. **Deliver.** Send the report, plus a short factual completion message only if one is needed. The report is the end of the turn.

Done when the report has a verified finding up front, at least one contract-valid what-if chart, references on the records they support, and no invented figures.

## What-if chart contract

The app renders charts from data, never from code. Write a `div` with a `data-agent-chart` attribute holding HTML-attribute-escaped JSON; the trusted renderer supplies the editable numeric inputs, reset, baseline-versus-scenario bars and live recalculation. Generated scripts stay blocked, so the chart is pure data: no JavaScript, event handlers, `script` tags, network requests or drawn controls.

Shape (a format example; replace every figure, label, unit and assumption with verified data or labeled user-editable assumptions):

```json
{"title":"Revenue what-if","assumption":"Illustrative estimate: conversion and price stay constant as lead volume changes; not a forecast.","inputs":[{"id":"leads","label":"Leads","value":1000,"min":0,"max":10000,"step":10},{"id":"conversion","label":"Conversion rate","value":5,"min":0,"max":100,"step":0.1,"unit":"%"},{"id":"price","label":"Revenue per customer","value":200,"min":0,"max":10000,"step":10,"unit":"USD"}],"outputs":[{"label":"Estimated revenue","unit":"USD","formula":["leads","conversion",100,"/","*","price","*"]}]}
```

**Formulas** are postfix token arrays. `["volume","price","*"]` is volume × price; `["revenue","cost","-"]` is revenue − cost. A token is a finite number, a declared input id, or one of the binary operators `+ - * / min max`; each operator consumes the two results before it. Outputs derive from inputs, never from precomputed arrays. Percent inputs are percentage points, so divide by 100 before multiplying by a rate. Pick factor ranges that avoid division by zero.

**Limits:**
- at most 4 charts per report, 1–8 inputs and 1–8 outputs per chart, 128 tokens per formula
- input ids unique, a letter then up to 31 letters, digits or underscores, and never `min` or `max`
- numbers and bounds within ±1e12, positive steps, min < max, initial value inside its bounds
- title ≤120 characters, assumption ≤500, labels ≤80, units ≤20, chart JSON ≤20,000

**Escaping and fallback:** in the attribute JSON, escape at least `& < > ' "` as HTML entities. Put a concise baseline summary inside the `div` as fallback HTML: the app swaps it for the live chart, and downloaded HTML keeps the summary, so describe exported PDF, spreadsheet, document or standalone HTML as static. When the user asks for another export format, deliver that export, plus an HTML what-if report when there is numeric data to model.

## Layout

The report sits on the chat background in light and dark mode, so every surface stays transparent: the report, wrappers, sections, metric cards, charts, table headers and rows. Group with spacing, type, subtle borders and dividers. Use color only for chart marks, data series and small status indicators, with readable labels in inherited theme text colors and values beside each visual so meaning never rests on color alone.

## References

Put tokens in HTML text nodes outside SVG, never in attributes or links. Reference an aggregate's source page or record only when a tool returned a matching reference; one record never stands for a whole total. When a reference is missing, fetch it if a tool can, or name the source in plain text. Non-HTML exports use plain source names.

## Language

Write in the user's language with everyday words. When a technical term is necessary, explain it in parentheses right after it, for example: conversion rate (the share of leads that became customers).
