---
id: tip
title: Tip
---

import { TipComponent } from "./tip.js"

<p>Text tips for </p>

## Placement

<p>Change tip placement by <code>placement</code> prop. Hover over the text paragraphs below to see tips.</p>

### Auto placements

<TipComponent type="auto" places={['auto-start', 'auto', 'auto-end']} />

### Top placements

<TipComponent type="top" places={['top-start', 'top', 'top-end']} />

### Right placements

<TipComponent type="right" places={['right-start', 'right', 'right-end']} />

### Bottom placements

<TipComponent type="bottom" places={['bottom-start', 'bottom', 'bottom-end']} />

### Left placements

<TipComponent type="left" places={['left-start', 'left', 'left-end']} />

## API

<TipComponent type="APItip" table={[
  ['text', 'string | React.ReactNode', '', 'Define the tip text'],
  ['* children', 'React.ReactNode', '', 'Define chip content'],
  ['placement', 'auto | auto-start | auto-end | top | top-start | top-end | right | right-start | right-end | bottom | bottom-start | bottom-end | left | left-start | left-end', 'auto', 'Set the placement of tip']
  ]} />