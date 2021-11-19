---
id: tip
title: Tip
---

import { TipComponent } from "./tip.js"

<p>See tip by hovering over buttons.</p>

## Placement

<p>Change tip placement by <code>placement</code> prop.</p>

### Auto placement

<TipComponent type="auto" places={['auto-start', 'auto', 'auto-end']}></TipComponent>

### Top placement

<TipComponent type="top" places={['top-start', 'top', 'top-end']}></TipComponent>

### Right placement

<TipComponent type="right" places={['right-start', 'right', 'right-end']}></TipComponent>

### Bottom placement

<TipComponent type="bottom" places={['bottom-start', 'bottom', 'bottom-end']}></TipComponent>

### Left placement

<TipComponent type="left" places={['left-start', 'left', 'left-end']}></TipComponent>

## API

<TipComponent type="APItip" table={[
  ['text', 'string | React.ReactNode', '', 'Defines the tip text'],
  ['* children', 'React.ReactNode', '', 'Defines chip content'],
  ['placement', 'auto | auto-start | auto-end | top | top-start | top-end | right | right-start | right-end | bottom | bottom-start | bottom-end | left | left-start | left-end', 'auto', 'Set the placement of tip']
  ]}></TipComponent>