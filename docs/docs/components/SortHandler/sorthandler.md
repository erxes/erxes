---
id: sorthandler
title: Sort Handler
---

import { SortHandlerComponent } from "./sorthandler.js"

<SortHandlerComponent />

<p>Same <code>sortField</code> will be handled at the same time. </p>
<SortHandlerComponent type="sorthandler" />

## API

<SortHandlerComponent type="APIsorthandler" table={[
  ['sortField', 'string', '', 'Sets the sort field'],
  ['label', 'string', '', 'Defines the handler name']
]} />