---
id: errormsg
title: Error message
---

import { ErrorMsgComponent } from "./errormsg.js"

<p>Provide Error message to indicate an error that occurred.</p>

## Example

<ErrorMsgComponent children="This is error" />

## API

<ErrorMsgComponent table={[
  ['children', 'string', '', 'your error message' ]
]} />