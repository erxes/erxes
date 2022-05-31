---
id: countsbytag
title: Counts by Tag
---

import {CountsByTagComponent} from "./countsbytag.js"

<p>The box, shows filter by tag.</p>

## Example

<CountsByTagComponent />

## Empty

<p>When fields have no list it shows emptyState.</p>
<CountsByTagComponent type="empty" />

## Loading

<p>Show loading spinner by <code>loading</code> prop.</p>
<CountsByTagComponent type="load" />

## Color

<p>Add custom color to icon by <code>colorCode</code> prop.</p>
<CountsByTagComponent type="color" />

## Count

<p>Show count numbers by giving them to <code>counts</code> prop.</p>
<CountsByTagComponent type="cnt" />

## Tree View

<p>Show tree view list by <code>treeView</code> prop. Fields should have <code>_id</code> and <code>parentId</code>.</p>
<CountsByTagComponent type="tree" />

## Related

<p>Find sum of all the related items by id with <code>relatedIds</code> prop. It shows on the item, defined the <code>relatedId</code> prop.</p>
<CountsByTagComponent type="tree" related />


## Manage Url

<p>Define url for managing icon with <code>manageUrl</code> prop.</p>
<CountsByTagComponent  type="manage" />

## API

<CountsByTagComponent  type="APIcountsbytag" />
