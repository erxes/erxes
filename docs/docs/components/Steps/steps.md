---
id: steps
title: Steps
---

import { StepComponent } from "./steps.js"

## Example

<p>Simple step component with image and content.</p>
<StepComponent type = 'example' />

## Active

<p>Change the step that expands on start with <code>active</code> prop.</p>
<StepComponent type = 'activeSteps' />

## Step

### Image

<p>Add image by <code>img</code> prop.</p>
<StepComponent type = 'img' />

### Title

<p>Add title by <code>title</code> prop. </p>
<StepComponent type = 'title' />

### No button

<p>Hide the "next" button by <code>noButton</code> prop.</p>
<StepComponent type = 'nobtn' />

## Api

### Steps

<StepComponent type = 'APIsteps' table={[
['children*', 'any', '', 'Contain step components'],
['active','number','','Change the step that expands on start'],
['maxStep','number','6','Limit the number of steps (always 6)']
]} />

### Step

<StepComponent type = 'APIstep' table={[
['stepNumber','number','','Define step number'],
['active','number','','Define which step that expands on start'],
['img','string','','Shows image'],
['title','string','','Shows title'],
['children','React.ReactNode', '', 'Shows content of step'],
['next','function', '', 'Define click function of next button'],
['noButton','boolen','','Hide the "Next" button'],
['onClick', 'function', '', 'Define click handler function']
]} />
