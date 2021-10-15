---
id: table
title: Table
---

import { TableComponent } from './table.js'


## Bordered

<p>Add border color with <code>bordered</code> prop.</p>
<TableComponent type="bordered" table={[
    ['1', 'Mark', 'Otto', '@mdo'],
    ['2', 'Jacob', 'Thornton', '@fat'],
    ['3', 'Larry', 'Bird', '@twitter']
]}></TableComponent>

## Merge cells

<p>Merge cells by <code>colSpan</code> prop.</p>
<TableComponent type="merge" table={[
    ['1', 'Mark', 'Otto', '@mdo'],
    ['2', 'Jacob', 'Thornton', '@fat']
]}></TableComponent>

## Striped

<p>Add striped color with <code>striped</code> prop.</p>
<TableComponent type="striped" table={[
    ['1', 'Mark', 'Otto', '@mdo'],
    ['2', 'Jacob', 'Thornton', '@fat'],
    ['3', 'Larry', 'Bird', '@twitter']
]}></TableComponent>

## Table hover

<p>Activate hover of table row by <code>hover</code> prop.</p>
<TableComponent type="hover" table={[
    ['1', 'Mark', 'Otto', '@mdo'],
    ['2', 'Jacob', 'Thornton', '@fat'],
    ['3', 'Larry', 'Bird', '@twitter']
]}></TableComponent>

## White-space

<p>Customize cell type with <code>white-space</code> prop.</p>
<TableComponent type="whiteSpace" table={[
    ['1', 'Mark', 'Otto', '@mdo'],
    ['2', 'Jacob', 'Thornton', '@fat']
]}></TableComponent>

## API

<TableComponent type="APItable" table={[
    ['bordered', 'boolean', 'false', 'Adds border color'],
    ['colSpan', 'number', '', 'Merges the number of row cells'],
    ['striped', 'boolean', 'false', 'Gives table strip color'],
    ['hover', 'boolean', 'false', 'Activates table hover'],
    ['white-space', 'normal | nowrap | pre | pre-wrap | pre-line | break-spaces', '', 'Costumizes thee cells']
]}></TableComponent>