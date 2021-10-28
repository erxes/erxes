---
id: progressbar
title: Progress Bar
---

import { ProgressBarComponent } from "./progressbar.js"

<ProgressBarComponent percent={35} colorOf="pink" closetext="close text" heights="20px"></ProgressBarComponent>

## API

<ProgressBarComponent type="APIprogressbar" table={[
  ['children', 'node', '', 'node that will come inside progress bar'],
  ['close', 'node', '', 'close node outside of progress bar'],
  ['percentage', 'number', '', 'percentage of progress bar'],
  ['color', 'string', '#dddeff', 'color of progress'],
  ['height', 'string', '36px', 'height of progress bar']
]}></ProgressBarComponent>