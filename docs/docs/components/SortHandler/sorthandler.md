---
id: sorthandler
title: Sort Handler
---

import { SortHandlerComponent } from "./sorthandler.js"

<p>Simple sort handler.</p>
<SortHandlerComponent type="default" />

## Label
<p>Add label by defining <code>label</code> prop.</p>
<SortHandlerComponent type="label" label="Label" />

## Field

<p>Same <code>sortField</code> will be handled at the same time. </p>
<SortHandlerComponent type="sameField" />

## API

<SortHandlerComponent type="APIsorthandler" table={[
  ['sortField', 'string', '', 'Set the sort field'],
  ['label', 'string', '', 'Define the handler name']
]} />