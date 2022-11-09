---
id: info
title: Info
---

import { InfoComponent } from './info.js'

<p>Provide contextual messages for typical user actions with info messages.</p>

## Examples

<p>Infos are available for any length of text. Just choose one of the five variants and modify the{" "} <code>type</code> prop. And write your own title by using <code>title</code> prop.</p>
<b>Primary is set by default.</b>
<InfoComponent func="infos" />

## Icon

<p>Add icons using <code>iconShow</code> prop.</p>
<InfoComponent func="icon" />

## API

<InfoComponent func="APIinfo" table={[
['children*', 'React.ReactNode', '', 'Shows info content'],
['type', 'primary | info | danger | warning | success', 'primary', 'Set type of info'],
['color', 'string', '', 'Gives custom color to info'],
['title', 'string', '', 'Shows title on top of the info'],
['iconShow', 'boolean', '', 'Shows icon depending on the info type'],
]} />
