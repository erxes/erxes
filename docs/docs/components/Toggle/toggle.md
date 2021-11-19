---
id: toggle
title : Toggle
---

import { ToggleComponent } from "./toggle.js"

## Example

<ToggleComponent type="simple" />

## Icons

<p>Define checked or unchecked icons by any type of <code>icons</code> prop.</p>
<ToggleComponent type="icons" />

## Checked

<p>Make the toggle switch checked on start by adding <code>defaultChecked</code> prop.</p>
<ToggleComponent type="defaultChecked" />

## Always checked

<p>Make the toggle switch checked but not switchable by adding <code>checked</code> prop.</p>
<ToggleComponent type="checked" />

## Disabled toggle switch

<p>Make the toggle disabled by <code>disabled</code> prop.</p>
<ToggleComponent type="disabled" />
<p>Make the toggle disabled by <code>disabled</code> prop when it's checked.</p>
<ToggleComponent type="disabled checked" />

## API

<ToggleComponent type="ApiToggle" table={[
  ['value', 'string', '', 'Defines the value'],
  ['name', 'string', '', 'Defines the name'],
  ['id', 'string', '', 'Defines toggle id'],
  ['checked', 'boolean', 'false', 'Set the toggle always checked'],
  ['defaultChecked', 'boolean', 'false', 'Set the toggle checked on start'],
  ["'aria-labelledby'", 'string', '', ''],
  ["'aria-label'", 'string', '', ''],
  ['onFocus', 'function', '', ''],
  ['onBlur', 'function', '', ''],
  ['disabled', 'boolean', '', 'Make the toggle disabled'],
  ['onChange', 'function', '', ''],
  ['icons', 'any', '', 'Add an icon'], 
]} />