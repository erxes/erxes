---
id: box
title: Box
---

import { BoxComponent } from "./box.js"

<p>Build vertically collapsing boxs.</p>

## Example

<p>Write your own title by using <code>title</code> prop.</p>

### Type

<BoxComponent type="example" />

### State

<p>Make the box expanded on start by adding <code>isOpen</code> prop.</p>
<BoxComponent type="open" />

### Collapsible

<BoxComponent type="collapsible" />

### Extra buttons

<BoxComponent type="extra" />

## API

<BoxComponent type="APIbox" table={[
    ['title', 'string', '', 'Shows title of the box'],
    ['name', 'string', '', 'Defines name'],
    ['isOpen', 'boolean', 'false', 'Makes the box expanded on start'],
    ['collapsible', 'boolean', 'false', ''],
    ['disabled', 'boolean', 'false', 'Disables the Button'],
    ['block', 'boolean', 'false', 'Makes the button full-width'],
    ['icon', 'string', '', 'Shows icon'],
    ['uppercase', 'boolean', 'false', 'Makes the button text uppercase']
]} />