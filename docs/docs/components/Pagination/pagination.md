---
id: pagination
title: Pagination
---

import { PaginationComponent } from "./pagination.js"

<p>Show pagination on footer to display lists by page.</p>

## Example

<p>Default pagination have 100 lists. Default list number per page is 20. Change "20 per page" to see more lists per page.</p>
<PaginationComponent />

## Count

<p><code>count</code> prop is define total number of lists.</p>
<PaginationComponent number={200}/>

## API

<PaginationComponent type="APIpagination" table={[
    ['count', 'number', '', 'Define total number of lists'],
    ['totalPagesCount', 'number', '', 'The number of total pages'],
    ['pages', 'number[]', '', 'The array that contains the pages'],
    ['currentPage', 'number', '', 'The page that shows on start'],
    ['isPaginated', 'boolean', '', 'Returns true when the total page number is greater than 1'],
]} />