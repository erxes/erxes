---
id: progressbar
title: Progress Bar
---

import { ProgressBarComponent } from "./progressbar.js"

<p>Provide progress bar to check work progress</p>

## Percent

<p>Add percentage by <code>percentage</code> prop. Add text by <code>children</code> prop. </p>
<ProgressBarComponent percent={35} ></ProgressBarComponent>

## Color

<p>Add color by <code>color</code> prop. </p>
<ProgressBarComponent percent={35} colorOf="pink" ></ProgressBarComponent>

## Height

<p>Add height by <code>height</code> prop. </p>
<ProgressBarComponent percent={35} colorOf="pink" heights="20px"></ProgressBarComponent>

## Close text

<p>Add close text by <code>close</code> prop. </p>
<ProgressBarComponent percent={35} colorOf="pink" closetext="Close text" heights="20px"></ProgressBarComponent>

## API

<ProgressBarComponent type="APIprogressbar" table={[
  ['children', 'node', '', 'node that will come inside progress bar'],
  ['close', 'node', '', 'close node outside of progress bar'],
  ['percentage', 'number', '', 'percentage of progress bar'],
  ['color', 'string', '#dddeff', 'color of progress'],
  ['height', 'string', '36px', 'height of progress bar']
]}></ProgressBarComponent>