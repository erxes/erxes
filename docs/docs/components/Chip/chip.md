---
id: chip
title: Chip
---

import { ChipComponent } from "./chip.js"

## Examples

<ChipComponent type="example" />

## Capitalized

<p>Make the first letter of chip text capital by adding <code>capitalize</code></p>
<ChipComponent type="capitalize" />

## Front Content

<p>Add an extra content in front of the chip by <code>frontContent</code> prop.</p>
<ChipComponent type="frontContent" />

## API

<ChipComponent type="APIchip" table={[
    ['capitalize', 'boolean', 'false', 'Make the first letter of chip text capital'],
    ['onClick', 'function', '', 'Click handler'],
    ['children', 'React.ReactNode', '', 'Shows chip text'],
    ['fronContent', 'string', '', 'Add an extra content in front of the chip'],
]} />