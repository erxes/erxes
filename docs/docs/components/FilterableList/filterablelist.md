---
id: filterablelist
title: Filterable List
---

import { FilterableListComponent } from "./filterablelist.js"

## Example

<p>Simple filterable list. It can be checked.</p>
<FilterableListComponent />

## Blank filterable list

<p>No data list.</p>
<FilterableListComponent type="null"/>

## Avatar

<p>Add avatar by <code>avatar</code> prop inside items array.</p>
<FilterableListComponent type="avatar"/>

## Links

<p>Add links below the list by <code>links</code> prop. </p>
<FilterableListComponent type="link"/>

## Show Checkmark

<p>Hide checkmark by <code>showCheckmark</code> prop. </p>
<FilterableListComponent type="check" bo={false} />

## Loading

<p>Show loading spinner by <code>loading</code> prop. </p>
<FilterableListComponent type="load" bo={true} />

## Tree view

<p>Show tree view list by <code>treeView</code> prop. Items should have parentId. </p>
<FilterableListComponent type="tree" bo={true} />

## API

<FilterableListComponent type="APIfilterablelist" table={[
  ['items', 'array', '', 'List items'],
  ['links', 'array', '', 'Links below list'],
  ['showCheckmark', 'boolean', 'true', 'Checkmark'],
  ['selectable', 'boolean', '30px', 'List spacing on the right'],
  ['loading', 'boolean', '', 'Loading spinner'],
  ['treeView', 'boolean', '', 'Tree view of list']
]} />