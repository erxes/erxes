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

## Api

### Steps

<StepComponent type = 'APIsteps' table={[
['children*', 'any', '', 'Contain step components'],
['active','number','','Change the step that expands on start'],
['maxStep','number','6','Limit the number of steps (always 6)']
]} />
