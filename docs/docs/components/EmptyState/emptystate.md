---
id: emptystate
title: Empty State
---

import { EmptyComponents } from './emptystate.js'

<p>Empty state with <code>icon</code> and <code>text</code> props.</p>
<EmptyComponents type="simple" item="info-circle" />

## Light

<p>Make your text invisible by using <code>light</code> prop. </p>
<EmptyComponents type="light" item="info-circle" />

## Icon size

<p>You can change the size of icon with <code>size</code> prop. </p>
<EmptyComponents type="size" item="info-circle" size="30" />

## Image

<p>Replace the icon with image by <code>image</code> prop.</p>
<EmptyComponents type="image" item="https://erxes.io/static/images/logo/logo_dark.svg" />

## Extra

<p>You can add extra item (text, number, tags, etc) to your empty state with <code>extra</code> prop.</p>
<EmptyComponents type="extra" item="info-circle" />

## API

<EmptyComponents type="APIempty" table={[
    ['text', 'string', "", 'Shows your text. If you want to show only text, use it with light prop'],
    ['icon', 'string', "", 'Shows icon'],
    ['image', 'string', "", 'Shows image'],
    ['size', 'string', "", 'Changes the size of icon'],
    ['extra', 'node', "", 'Adds other components or text'],
    ['light', 'boolean', "", 'Show only first row']
]} />