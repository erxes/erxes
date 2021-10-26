---
id: tip
title: Tip
---

import { TipComponent } from "./tip.js"

<p>See tip by hovering over buttons.</p>

## Placement

<p>Change tip placement by <code>placement</code> prop.</p>

### Auto placement

<TipComponent type="auto" txt="Text" place={['auto-start', 'auto', 'auto-end']}></TipComponent>

### Top placement

<TipComponent type="top" txt="Text" place={['top-start', 'top', 'top-end']}></TipComponent>

### Right placement

<TipComponent type="right" txt="Text" place={['right-start', 'right', 'right-end']}></TipComponent>

### Bottom placement

<TipComponent type="bottom" txt="Text" place={['bottom-end', 'bottom', 'bottom-start']}></TipComponent>

### Left placement

<TipComponent type="left" txt="Text" place={['left-end', 'left', 'left-start']}></TipComponent>

## API

<TipComponent type="APItip" table={[
  ['text', 'string', '', 'tip text'],
  ['children', 'node', '', 'container inside the tip'],
  ['placement', 'auto-start | auto | auto-end | top-start | top | top-end | right-start | right | right-end | bottom-end | bottom | bottom-start | left-end | left | left-start', '', 'placement of tip']
  ]}></TipComponent>