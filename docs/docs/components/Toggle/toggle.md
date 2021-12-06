---
id: toggle
title : Toggle
---

import { ToggleComponent } from "./toggle.js"

## Example

<p>Default toggle.</p>
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
  ['value', 'string', '', 'Define the value'],
  ['name', 'string', '', 'Define the name'],
  ['id', 'string', '', 'Define toggle id'],
  ['checked', 'boolean', 'false', 'Set the toggle always checked'],
  ['defaultChecked', 'boolean', 'false', 'Set the toggle checked on start'],
  ["'aria-labelledby'", 'string', '', 'The value of the aria-labelledby attribute of the wrapped input element'],
  ["'aria-label'", 'string', '', 'The value of the aria-label attribute of the wrapped input element'],
  ['onFocus', 'function', '', 'Callback function to invoke when field has focus'],
  ['onBlur', 'function', '', 'Callback function to invoke when field loses focus'],
  ['disabled', 'boolean', '', 'Make the toggle disabled'],
  ['onChange', 'function', '', 'Callback function to invoke when the user clicks on the toggle'],
  ['icons', 'any', '', 'Add an icon'], 
]} />