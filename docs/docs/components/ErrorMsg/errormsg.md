---
id: errormsg
title: Error message
---

import { ErrorMsgComponent } from "./errormsg.js"

<p>Example of error message</p>
<ErrorMsgComponent children="This is error" />

## API

<ErrorMsgComponent table={[
  ['children', 'string', '', 'text for your error message' ]
]} />