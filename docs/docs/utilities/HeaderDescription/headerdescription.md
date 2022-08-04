---
id: headerdescription
title: Header Description
---

import { HeaderDescriptionComponent } from "./headerdescription.js"

<p>Expandable description, shows image and description when expanded but just title when it's not.</p>

## Example

<HeaderDescriptionComponent />

## API

<HeaderDescriptionComponent type="APIheaderdescription" table={[
  ['icon*', 'string', '', 'Shows image before title'],
  ['title*', 'string', '', 'Define title of description'],
  ['description*', 'string', '', 'Define description']
]}/>