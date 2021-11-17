---
id: toggle
title : Toggle
---

import { ToggleComponent } from "./toggle.js"

## Simple toggle switch

<p>Simple toggle switch.</p>
<ToggleComponent type="simple" />

## Toggle switch icons

<p>Define checked or unchecked icons by any type of <code>icons</code> prop.</p>
<ToggleComponent type="icons" />

## Checked toggle switch

<p>Not changeable toggle switch.</p>
<ToggleComponent type="checked" />


## Default checked toggle switch

<p>Changeable toggle switch with checked by default.</p>
<ToggleComponent type="defaultChecked" />

## Disabled toggle switch

<p>Toggle switch that can be disabled when checked or unchecked.</p>
<ToggleComponent type="disabled checked" />
<ToggleComponent type="disabled" />

## API

<ToggleComponent type="ApiToggle" table={[
  ['value', 'string', '', 'Defines the value'],
  ['name', 'string', '', 'Defines the name'],
  ['checked', 'boolean', '', 'Set the toggle always checked'],
  ['defaultChecked', 'boolean', '', 'Set the toggle checked on start'],
  ['disabled', 'boolean', '', 'Make the toggle disabled'],
  ['icons', 'any', '', 'Add an icon'], 
]} />