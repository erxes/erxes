---
id: pagination
title: Pagination
---

import { PaginationComponent } from "./pagination.js"

<p>Show pagination on footer to display lists by page.</p>

## Example

<p>Default pagination have 100 lists. Change "20 per page" to see more lists per page.</p>
<PaginationComponent />

## Count

<p><code>count</code> prop is define total number of lists.</p>
<PaginationComponent number={200}/>

## API

<PaginationComponent type="APIpagination" table={[['count', 'number', '', 'Define total number of lists']]} />