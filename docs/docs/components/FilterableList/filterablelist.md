---
id: filterablelist
title: Filterable List
---

import { FilterableListComponent } from "./filterablelist.js"

## Example

<p>Simple filterable list. It can be checked.</p>
<FilterableListComponent />

## Blank filterable list

<p>When items have no list it'll show below.</p>
<FilterableListComponent type="null"/>

## Loading

<p>Show loading spinner by <code>loading</code> prop. </p>
<FilterableListComponent type="load" boolean={true} />

## Style

<p>Add list style by <code>style</code> prop to items array.</p>
<FilterableListComponent type="style"/>

## Avatar

<p>Add avatar by <code>avatar</code> prop to items array.</p>
<FilterableListComponent type="avatar"/>

## Additional icon

<p>Add additional icon by <code>additionalIconClass</code> prop to items array.</p>
<FilterableListComponent type="additionalIconClass"/>

## Links

<p>Add links below the list by <code>links</code> prop. </p>
<FilterableListComponent type="link"/>

## Show Checkmark

<p>Hide checkmark by <code>showCheckmark</code> prop. </p>
<FilterableListComponent type="check" boolean={false} />


## Tree view

<p>Show tree view list by <code>treeView</code> prop. Items should have <code>_id</code> and <code>parentId</code>. </p>
<FilterableListComponent type="tree" boolean={true} />

## API

<FilterableListComponent type="APIfilterablelist" />