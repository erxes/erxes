---
id: tag
title: Tags
---

import { TagComponent } from "./tag.js"

<p>Use <code>_id</code> and <code>name</code> props for connecting with other function.</p>

## Color

<p>Give any color to tag by <code>colorCode</code> prop.</p>
<TagComponent type="color" colors={['red', 'yellow', 'blue', 'purple', 'green']} />

## Limit

<p>Limit number of tags to show by <code>limit</code> prop.</p>
<TagComponent type="limit" colors={['red', 'yellow', 'blue', 'purple', 'green']} />

## API

<TagComponent type="APItags"/>