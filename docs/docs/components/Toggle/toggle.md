---
id: toggle
title : Toggle
---

import { ToggleComponent } from "./toggle.js"

## Simple toggle switch

<p>Simple toggle switch.</p>
<ToggleComponent type="simple"></ToggleComponent>

## Toggle switch icons

<p>Define checked or unchecked icons by any type of <code>icons</code> prop.</p>
<ToggleComponent type="icons"></ToggleComponent>

## Checked toggle switch

<p>Not changeable toggle switch.</p>
<ToggleComponent type="checked"></ToggleComponent>


## Default checked toggle switch

<p>Changeable toggle switch with checked by default.</p>
<ToggleComponent type="defaultChecked"></ToggleComponent>

## Disabled toggle switch

<p>Toggle switch that can be disabled when checked or unchecked.</p>
<ToggleComponent type="disabled checked"></ToggleComponent>
<ToggleComponent type="disabled"></ToggleComponent>

## API

<ToggleComponent type="ApiToggle" table={[
  ['value', 'string', '', 'Define toggle value'],
  ['name', 'string', '', 'Define toggle name'],
  ['id', 'string', '', 'Define toggle id'],
  ['checked', 'boolean', '', 'Checked toggle'],
  ['defaultChecked', 'boolean', '', 'Default checked toggle'],
  ['disabled', 'boolean', '', 'Disabled toggle'],
  ['icons', 'any', '', 'Toggle icon'], 
]}></ToggleComponent>