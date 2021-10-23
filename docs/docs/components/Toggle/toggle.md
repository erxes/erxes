---
id: toggle
title : Toggle
---

import { ToggleComponent } from "./toggle.js"

## Simple toggle switch

<p>Simple toggle switch.</p>
<ToggleComponent type="simple"></ToggleComponent>

## Checked toggle switch

<p>Not changeable toggle switch.</p>
<ToggleComponent type="checked"></ToggleComponent>

## Default checked switch

<p>Changeable toggle switch with checked by default.</p>
<ToggleComponent type="defaultChecked"></ToggleComponent>

## Disabled toggle switch

<p>Toggle switch that can be disabled when checked or unchecked.</p>
<ToggleComponent type="disabled checked"></ToggleComponent>
<ToggleComponent type="disabled"></ToggleComponent>

## API

<ToggleComponent type="ApiToggle" table={[
  ['value', 'string', '', 'toggle value'],
  ['name', 'string', '', 'toggle name'],
  ['id', 'string', '', 'toggle id'],
  ['checked', 'boolean', '', 'checked toggle'],
  ['defaultChecked', 'boolean', '', 'default checked toggle'],
  ['diabled', 'boolean', '', 'disabled toggle'],
  ['icon', 'any', '', 'toggle icon'],  
]}></ToggleComponent>