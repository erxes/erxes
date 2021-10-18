---
id: emptystate
title: Empty State
---

import { EmptyComponents } from './emptystate.js'

<p>Empty state with <code>icon</code> and <code>text</code> props.</p>
<EmptyComponents type="simple" />

## Light

<p>If you use <code>light</code> prop, your text won't show. </p>
<EmptyComponents type="light" />

## Icon size

<p>You can change the size of icon with <code>size</code> prop. </p>
<EmptyComponents type="size" />

## Image

<p>Empty state with <code>image</code> prop.</p>
<EmptyComponents type="image" img="https://erxes.io/static/images/logo/logo_dark.svg" />

## Extra

<p>Empty state with <code>extra</code> prop.</p>
<EmptyComponents type="extra" />

## API

<EmptyComponents type="APIempty" table={[
    ['text', 'string', "", 'Shows your text. If you want to show only text, use it with light prop'],
    ['icon', 'string', "", 'Shows icon'],
    ['image', 'string', "", 'Shows image'],
    ['size', 'string', "", 'Changes the size of icon'],
    ['extra', 'node', "", 'Adds other components or text'],
    ['light', 'boolean', "", 'Show only first row']
]} />