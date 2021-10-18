---
id: emptystate
title: Empty State
---

import { EmptyComponents } from './emptystate.js'

<p>Empty state with <code>icon</code> and <code>text</code> props.</p>
<EmptyComponents type="simple" text="Text" icon="info-circle"></EmptyComponents>

## Light

<p>If you use <code>light</code> prop, your text won't show. </p>
<EmptyComponents type="light" text="Text" icon="info-circle"></EmptyComponents>

## Icon size

<p>You can change the size of icon with <code>size</code> prop. </p>
<EmptyComponents type="size" text="Text" icon="info-circle" size="30"></EmptyComponents>

## Image

<p>Empty state with <code>image</code> prop.</p>
<EmptyComponents type="image" text="Text" img="https://erxes.io/static/images/logo/logo_dark.svg"></EmptyComponents>

## Extra

<p>Empty state with <code>extra</code> prop.</p>
<EmptyComponents type="extra" text="Text" icon="info-circle" size="30"></EmptyComponents>

## API

<EmptyComponents type="APIempty" table={[
    ['text', 'string', 'Shows your text. If you want to show only text, use it with light prop'],
    ['icon', 'string', 'Shows icon'],
    ['image', 'string', 'Shows image'],
    ['size', 'string', 'Changes the size of icon'],
    ['extra', 'node', 'Adds other components or text'],
    ['light', 'boolean', 'Show only first row']
]}></EmptyComponents>