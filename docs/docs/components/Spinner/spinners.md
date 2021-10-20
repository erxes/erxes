---
id: spinners
title: Spinners
---

import { SpinnerComponent } from "./spinners.js"

<p>Spinners can be used to show the loading state in your projects.</p>

## Examples

### Sizing

<p>Change the sizing using <code>size</code> prop.</p>
<SpinnerComponent type="size" values={[40, 15 ]} />

## Position

<p>Change the position with <code>left</code>, <code>right</code>, <code>top</code>, <code>bottom</code> props depending on your purpose.</p>
<SpinnerComponent type="position" values={['10%', '50%', 'auto']} rights={['auto', 'auto', '10%']} />

## Objective

<p>Make your spinner objective by <code>objective</code> prop.</p>
<SpinnerComponent type="objective" values={['10%']}/>

## API

<SpinnerComponent type="APIspinner" table={[
    ['objective', 'boolean', 'false', 'Make your spinner objective'],
    ['size', 'number', '26', 'Change the spinning size'],
    ['left', 'string', '50%', 'Determine space from left side'],
    ['right', 'string', 'auto', 'Determine space from right side'],
    ['top', 'string', '50%', 'Determine space from top side'],
    ['bottom', 'string', 'auto', 'Determine space from bottom side']
]} />