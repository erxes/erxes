---
id: step
title: Step
---

import { StepComponent } from "./step.js"

## Example

### Image

<p>Add logo or image by <code>img</code> prop. When it doesn't have a <code>img</code> prop it'll show "step-icon" text. </p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" />

### Title

<p>Add title by <code>title</code> prop. </p>
<StepComponent titleof="Title" />

### Children

<p>Add children by <code>children</code> prop. </p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" child="Children" />

### Active number and step number

<p>When <code>active</code> number and <code>stepNumber</code> is same, it'll show it's content. </p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" activenumber={3} stepnumber={3}/>

<p>When it's different it'll only show clickable box with logo or image. </p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" activenumber={3} stepnumber={5}/>

<!-- ### onClick

<p>Function of click when clickable box is clicked.</p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" activenumber={3} stepnumber={5} type="click" /> -->

### Next button

<p>Function of next button or when it doesn't have onClick function.</p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" activenumber={3} stepnumber={3} type="next" />
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" activenumber={3} stepnumber={5} type="next" />

### No button

<p>Hide next button by <code>noButton</code> prop. </p>
<StepComponent logo="https://erxes.io/static/images/logo/logo_dark.svg" activenumber={3} stepnumber={3} type="next" button={true}/>


## API

<StepComponent type="APIstep" table={[
  ['stepNumber','number', '', 'Step number'],
  ['active','number', '','Active number'],
  ['img', 'string', '"step-icon"','Logo or image'],
  ['title','string', '','Title'],
  ['next', 'void', '', 'Fuction of "Next" button'],
  ['noButton','boolen','','Hide "Next" button']
]} />