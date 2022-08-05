---
id: filterbyparams
title: Filter by Params
---

import {FilterByParamsComponent} from "./filterbyparams.js"

<p>Simple list that can become searchable by parameters.</p>

## Example

<FilterByParamsComponent />

## Empty

<p>When fields have no list it shows emptyState.</p>
<FilterByParamsComponent type="empty" />

## Loading

<p>Show loading spinner by <code>loading</code> prop.</p>
<FilterByParamsComponent type="load" />

## Count

<p>Show count numbers by giving them to <code>counts</code> prop.</p>
<FilterByParamsComponent type="count" />

## Multiple

<p>Make it possible to select multiple items by <code>multiple</code> prop.</p>
<FilterByParamsComponent type="multiple" />

## Searchable

<p>Add search bar on top of the list and make it searchable with <code>searchable</code> prop.</p>
<FilterByParamsComponent type="search" />

## Icon

<p>Add avatar by <code>icon</code> prop.</p>
<FilterByParamsComponent type="icon" />

## Color

<p>Add custom color to icon by <code>colorCode</code> prop.</p>
<FilterByParamsComponent type="icon" color/>

## Tree view

<p>Show tree view list by <code>treeView</code> prop. Fields should have <code>_id</code> and <code>parentId</code>.</p>
<FilterByParamsComponent type="tree" />

## Related

<p>Find sum of all the related items by id with <code>relatedIds</code> prop. It shows on the item, defined the <code>relatedId</code> prop.</p>
<FilterByParamsComponent type="tree" related />

## API

<FilterByParamsComponent type="APIfilterbyparams" />
