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
<TableComponent type="whiteSpace" table={[
    ['1', 'James', 'Smith', '@james'],
    ['2', 'Robert', 'Rodriguez', '@robert'],
    ['3', 'Larry the Bird. Larry Joe Bird (born December 7, 1956) is an American former professional basketball player, coach and executive in the National Basketball Association (NBA). Nicknamed the Hick from French Lick and Larry Legend,Bird is widely regarded as one of the greatest basketball players of all time.', 'Bird', '@larry']
]} />

## API

<TableComponent type="APItable" table={[
['children*', 'React.ReactNode', '', 'Shows table content'],
['striped', 'boolean', 'false', 'Gives table strip color'],
['bordered', 'boolean', 'false', 'Add border color'],
['hover', 'boolean', 'false', 'Activates table hover'],
['responsive', 'boolean', 'false', 'Add horizontal scroll bar when needed'],
['whiteSpace', 'normal | nowrap | pre | pre-wrap | pre-line | break-spaces', '', 'Costumizes the cells'],
['alignTop', 'boolean', 'false', 'Writes content vertically top']
]} />
