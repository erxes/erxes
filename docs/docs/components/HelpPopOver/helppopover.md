---
id: helppopover
title: Help Popover
---

import { PopoverComponent } from "./helppopover.js"

<p>See pop over by hovering over it, click on it, and focus on it.</p>
<PopoverComponent triggerOf={[ 'hover', 'click', 'focus' ]}/>

## API

<PopoverComponent type="APIpopover" table={[
  ['title', 'string', '', 'Define title of help'],
  ['trigger', 'hover | click | focus', 'click', 'Triggers the help information']
 ]}/>