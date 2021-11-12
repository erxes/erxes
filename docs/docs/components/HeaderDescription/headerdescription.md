---
id: headerdescription
title: Header Description
---

import { HeaderDescriptionComponent } from "./headerdescription.js"

<p>Expandable description, shows image and description when expanded but just title when it's not expanded.</p>

## Example

<HeaderDescriptionComponent/>

## API

<HeaderDescriptionComponent type="APIheaderdescription" table={[
  ['* icon', 'string', '', 'Url of image'],
  ['* title', 'string', '', 'Title of description'],
  ['* description', 'string', '', 'Description']
]}/>