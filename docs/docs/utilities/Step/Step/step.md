---
id: step
title: Step
---

import { StepComponent } from "./step.js"

### Image

<p>Add image by <code>img</code> prop.</p>
<StepComponent type = 'img' />

### Title

<p>Add title by <code>title</code> prop. </p>
<StepComponent type = 'title' />

### No button

<p>Hide the "next" button that locates to the next step by <code>noButton</code> prop.</p>
<StepComponent type = 'nobtn' />

## Api

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
