---
id: info
title: Info
---

import { InfoComponent } from './info.js'

<p>Provide contextual messages for typical user actions with info messages.</p>

## Examples

<p>Infos are available for any length of text. Just choose one of the five variants and modify the{" "} <code>type</code> prop. And write your own title by modifying <code>title</code> prop.</p>
<b>Primary is set by default.</b>
<InfoComponent type="infos" types={['Primary', 'Info', 'Danger', 'Warning', 'Success']}></InfoComponent>

## Icon

<p>Add icons using <code>iconShow</code> prop.</p>
<InfoComponent type="icon" types={['Primary', 'Info', 'Danger', 'Warning', 'Success']} icons={['envelope-alt', 'info-circle', 'times-circle', 'exclamation-triangle', 'check-circle']}></InfoComponent>

## API

<InfoComponent type="APIinfo" table={[
    ['type', 'primary | info | danger | warning | success', 'primary', 'Set type of info'],
    ['iconShow', 'boolean', '', 'Shows icon'],
    ['title', 'string', '', 'Shows title on top of the info']
]}></InfoComponent>