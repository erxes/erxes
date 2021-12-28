---
id: form
title: Form
---

import { FormComponent } from "./form.js"

<p>Examples and usage guidelines for form, form control and so on.</p>

## Example

<p>Build any form for your purpose. </p>
<p>Render following code with <code>{`<Form renderContent={content} />`}</code></p>
<FormComponent type="full" />

## Form group 

<p>The <code>FormGroup</code> component wraps a form control with proper spacing, along with support for a label, help text, and validation state. Place form elements horizontally by <code>horizontal</code> prop.</p>

<FormComponent type="group" />

<FormComponent type="group" addvalue={true} /> 


## Form label

<p>Add label with <code>ControlLabel</code> component. Customize label with <code>required</code> and <code>uppercase</code> props. </p>
<FormComponent type="label"  />

## Form control

### Input 

<p>Default default input type is <code>input</code>. When there is no componentClass it'll go as default.</p>
<FormComponent type="control" />

### Round

<p>Give boolean value to <code>round</code> prop to have round edged input.</p>
<FormComponent type="control" controltype="round" addvalue={true} />

### Placeholder

<p>Add placeholder on input by <code>placeholder</code> prop.</p> 
<FormComponent type="control" controltype="placeholder" addvalue="Place holder" />

### Value

<p>Declare unchangeable value of input with <code>value</code> prop.</p> 
<FormComponent type="control" controltype="value" addvalue="Value" />

### Default value

<p>Declare default value of input with <code>defaultValue</code> prop. Default value is changeable.</p> 
<FormComponent type="control" controltype="defvalue" addvalue="Default value" />

### Select

<p>To create selectable input define component class as "select" and insert options to <code>options</code> prop.</p>
<FormComponent type="control" elementType="select" addvalue={[{label: "Select options"}, {label: "Option 1"}, {label:"Option 2"}, {label:"Option 3"}]} />

### Poll

<p>Poll percentage is devided fairly by the option number. </p>
<FormComponent type="control" elementType="poll" addvalue={["Option 1", "Option 2", "Option 3"]} />

### Check box

<p>When there's no child only check box will be displayed. </p>
<FormComponent type="control" controltype="color" elementType="checkbox"/>
<p>Customize check box color by <code>color</code> prop. </p>
<FormComponent type="control" controltype="color" elementType="checkbox" addvalue="green" />
<p>Display desired output by <code>children</code> prop. </p>
<FormComponent type="control" controltype="checkbox" elementType="checkbox" addtext="Checked" />
<p>Make check box unchangeably checked by <code>checked</code> prop. </p>
<FormComponent type="control" controltype="checkedbox" elementType="checkbox" addvalue={true} addtext="Checked" />
<p>Make check box checked on start by <code>defaultChecked</code> prop. It's changeable. </p>
<FormComponent type="control" controltype="defcheckedbox" elementType="checkbox" addvalue={true} addtext="Default checked" />

### Radio

<p>Add simple radio by <code>radio</code> prop. </p>
<FormComponent type="control" elementType="radio" addtext="Radio" />

## Date control

<p>Add chooseable date input by <code>DateControl</code> component. </p>
<FormComponent type="date" />

## Validations

<p>Provide valuable, actionable feedback to your users with form validation feedback. Submit to validate. When input value doesn't match with input type it'll display error message. </p><p>Render following code with <code>{`<Form renderContent={val} />`}</code></p>
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
['ignoreTrans', 'boolean', '', 'Ignore translation'],
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
['componentClass', 'string', 'select | radio | poll | checkbox | textarea', 'Define input type'],
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