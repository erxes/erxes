---
id: table
title: Table
---

import { TableComponent } from './table.js'


## Bordered

<p>Add border color with <code>bordered</code> prop.</p>
<TableComponent type="bordered" table={[
    ['1', 'James', 'Smith', '@james'],
    ['2', 'Robert', 'Rodriguez', '@robert'],
    ['3', 'Larry', 'Bird', '@twitter']
]} />

## Merge cells

<p>Merge cells by <code>colSpan</code> prop.</p>
<TableComponent type="merge" mergedCellText="Larry the bird" table={[
    ['1', 'James', 'Smith', '@james'],
    ['2', 'Robert', 'Rodriguez', '@robert']
]} />

## Striped

<p>Add striped color with <code>striped</code> prop.</p>
<TableComponent type="striped" table={[
    ['1', 'James', 'Smith', '@james'],
    ['2', 'Robert', 'Rodriguez', '@robert'],
    ['3', 'Larry', 'Bird', '@larry']
]} />

## Table hover

<p>Activate hover of table row by <code>hover</code> prop.</p>
<TableComponent type="hover" table={[
    ['1', 'James', 'Smith', '@james'],
    ['2', 'Robert', 'Rodriguez', '@robert'],
    ['3', 'Larry', 'Bird', '@larry']
]} />

## White-space

<p>Customize cell type with <code>white-space</code> prop.</p>
<TableComponent type="whiteSpace" mergedCellText="Larry the Bird. Larry Joe Bird (born December 7, 1956) is an American former professional basketball player, coach and executive in the National Basketball Association (NBA). Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird is widely regarded as one of the greatest basketball players of all time." table={[
    ['1', 'James', 'Smith', '@james'],
    ['2', 'Robert', 'Rodriguez', '@robert']
]} />

## API

<TableComponent type="APItable" table={[
    ['bordered', 'boolean', 'false', 'Adds border color'],
    ['colSpan', 'number', '', 'Merges the number of row cells'],
    ['striped', 'boolean', 'false', 'Gives table strip color'],
    ['hover', 'boolean', 'false', 'Activates table hover'],
    ['white-space', 'normal | nowrap | pre | pre-wrap | pre-line | break-spaces', '', 'Costumizes thee cells']
]} />