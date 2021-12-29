---
id: form
title: Form
---

import { FormComponent } from "./form.js"

<p>Examples and usage guidelines for form, form control and so on. Assemble desired components to make complete form for your requirements.</p>

## Form control

<p>The FormControl component renders a form control with erxes-ui styling. </p>

### Input types

<p>Default default input type is <code>input</code>. When there is no componentClass it'll go as default.</p>
<FormComponent type="control" controltype="input" />

### Select

<p>To create selectable input define component class as "select" and insert options to <code>options</code> prop.</p>
<FormComponent type="control" controltype="select" />

### Poll

<p>Poll percentage is devided fairly by the option number. </p>
<FormComponent type="control" controltype="poll" />

### Check box

<p>Erxes-ui have a variety of checkbox style. The first one is default checkbox. Customize it with <code>color</code> prop. You can also disable it with <code>disable</code> prop. To display word or react node give React.Node to <code>children</code> prop. Checked checkbox is unchangeable. Default checked box is checked from start, and changeable. </p>
<FormComponent type="control" controltype="checkbox"/>

### Radio

<p>Erxes-ui have a variety of radio style. The first one is default radio. Customize it with <code>color</code> prop. You can also disable it with <code>disable</code> prop. To display word or react node give React.Node to <code>children</code> prop. </p>
<FormComponent type="control" controltype="radio"/>

## Form label

<p>Add label with <code>ControlLabel</code> component. Customize label with <code>required</code> and <code>uppercase</code> props. </p>
<FormComponent type="label" elementType="required" addvalue={true} addtext="Required"/>
<p><code>uppercase</code> prop is true by default. To make it lowercase give "false" value to prop.</p>
<FormComponent type="label" elementType="uppercase" addvalue={false} addtext="Uppercase" />

## Form group 

<p>The <code>FormGroup</code> component wraps a form control with proper spacing, along with support for a label, help text, and validation state. </p>
<FormComponent type="group" />
<p>Place form elements horizontally by <code>horizontal</code> prop.</p>
<FormComponent type="group" addvalue={true} /> 

## Date control

<p>Add chooseable date input by <code>DateControl</code> component. </p>
<FormComponent type="date" />

## Validations

<p>Provide valuable, actionable feedback to your users with form validation feedback. Submit to validate. When input value doesn't match with input type it'll display error message. </p>
<FormComponent type="validations" />

## API

### Form

<FormComponent type="APIform" table={[
  ['renderContent*', 'React.ReactNode', '', 'Define content that will be rendered'],
  ['onSubmit', 'any', '', 'Add additional function when submit'],
  ['autoComplete', 'string', '', 'Define word to auto complete'],
]} />

### Form group

<FormComponent type="APIgroup" table={[
['children*', 'React.ReactNode', '', 'Define group contents'],
['horizontal', 'boolean', 'false', 'Display children horizontally']
]} />

### Control label

<FormComponent type="APIlabel" table={[
['children*', 'React.ReactNode | string', '', 'Define item to display'],
['ignoreTrans', 'boolean', '', 'Default is translate the words. To ignore translation activate this prop'],
['required', 'boolean', 'false', 'Display red star(*) after children to state that it is required'],
['uppercase', 'boolean', 'true', 'Make all string capitalize']
]} />

### Form control

<FormComponent type="APIcontrol" table={[
['children', 'React.ReactNode', '', 'Define children item'],
['id', 'string', '', 'Define component id for easier control'],
['onChange', 'function', '', 'Define function when input changes'],
['onClick', 'function', '', 'Define function when input is clicked'],
['onKeyPress', 'function', '', 'Define function is triggered when the user is pressing a key in the input field'],
['onKeyDown', 'function', '', 'Define function is triggered when the user is pressing a key in the input field'],
['defaultValue', 'any', '', 'Define value displayed on start'],
['value', 'any', '', 'Define unchangeable value'],
['defaultChecked', 'boolean', '', 'Make check box checked on start'],
['checked', 'boolean', '', 'Display unchangeable checked check box'],
['placeholder', 'string', '', 'Display word on input space'],
['type', 'string', '', 'Define input control type to use it with other functions'],
['name', 'string', '', 'Give name to control to control it easier'],
['options', 'any[]', '', 'Define options of select type or poll type inputs'],
['required', 'boolean', '', 'Make input required'],
['disabled', 'boolean', '', 'Make input disabled'],
['round', 'boolean', '', 'Make input border rounder'],
['autoFocus', 'boolean', '', 'Focus on input on start'],
['autoComplete', 'string', '', 'Define word to auto complete'],
['onFocus', 'function', '', 'Define function when input is focused'],
['componentClass', 'string', 'input | select | radio | poll | checkbox | textarea', 'Define input type'],
['errors', 'any', '', 'Define error to display'],
['registerChild', 'function', '', 'Define function called during the Mounting phase of the React Life-cycle i.e after the component is rendered'],
['onBlur', 'function', '', 'Define additional function'],
['maxHeight', 'number', '', 'Define max height of text area'],
['color', 'string', '', 'Customize input color'],
]} />

### Date control

<FormComponent type="APIdate" table={[
['onChange', 'function', '', 'Define function which is rendered when date changes'],
['defaultValue', 'any', '', 'Display value on start'],
['value', 'any', '', 'Display unchangeable value'],
['placeholder', 'string', '', 'Display string on input from start']
]} />