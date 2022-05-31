---
id: box
title: Box
---

import { BoxComponent } from "./box.js"

<p>Build vertically collapsing boxes.</p>

## Title

<p>Write your own title by using <code>title</code> prop.</p>
<BoxComponent type="example" />

## State

<p>Make the box expanded on start by adding <code>isOpen</code> prop.</p>
<BoxComponent type="open" />

## Collapsible

<p>Make the box collapsible when the content is way too long by adding <code>collapsible</code> prop.</p>
<BoxComponent type="collapsible" />

## Extra buttons

<p>Add an extra button that shows when the box is expanded by <code>extraButtons</code> prop.</p>
<BoxComponent type="extra" />

## API

<BoxComponent type="APIbox" table={[
    ['title*', 'string', '', 'Shows title of the box'],
    ['name', 'string', '', 'Define name'],
    ['children*', 'React.ReactNode', '', 'Gives content to box'],
    ['extraButtons', 'React.ReactNode', '', 'Display an extra button on the box'],
    ['callback', 'function', '', 'Define additional fuction when title is clicked'],
    ['collapsible', 'boolean', 'false', 'Make the box collapsible'],
    ['isOpen', 'boolean', 'false', 'Make the box expanded on start'],
]} />