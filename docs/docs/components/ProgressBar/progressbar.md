---
id: progressbar
title: Progress Bar
---

import { ProgressBarComponent } from "./progressbar.js"

<p>Provide progress bar to check work progress.</p>

## Percentage

<p>Add percentage by <code>percentage</code> prop. Add text by <code>children</code> prop. </p>
<ProgressBarComponent ></ProgressBarComponent>

## Color

<p>Set the custom color by <code>color</code> prop. </p>
<ProgressBarComponent color="pink" ></ProgressBarComponent>

## Height

<p>Set the custom height by <code>height</code> prop. </p>
<ProgressBarComponent height="20px"></ProgressBarComponent>

## Close

<p>Add close content by <code>close</code> prop. </p>
<ProgressBarComponent height="20px" close></ProgressBarComponent>

## API

<ProgressBarComponent type="APIprogressbar" table={[
  ['children', 'React.ReactNode', '', 'Shows content on progress bar'],
  ['close', 'React.ReactNode', '', 'Displays the close element on bottom of the progress bar'],
  ['percentage*', 'number', '', 'Sets percentage of the progress bar'],
  ['color', 'string', '#dddeff', 'Sets color of the progress'],
  ['height', 'string', '36px', 'Sets height of the progress bar']
]}></ProgressBarComponent>