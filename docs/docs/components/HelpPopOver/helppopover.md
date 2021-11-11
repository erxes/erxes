---
id: helppopover
title: Help Pop Over
---

import { HelpPopOverComponent } from "./helppopover.js"

<p>See pop over by hovering over it, click on it, and focus on it.</p>
<HelpPopOverComponent triggerOf={[ 'hover', 'click', 'focus' ]}/>

## API

<HelpPopOverComponent type="APIhelppopover" table={[
  ['* title', 'string', '', 'Title of help'],
  ['* trigger', 'hover | click | focus', 'click', 'Trigger of displaying help information']
 ]}/>