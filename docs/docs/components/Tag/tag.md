---
id: tag
title: Tags
---

import { TagComponent, ApiTable } from "./tag.js"

<p>Use <code>_id</code> and <code>name</code> props for connecting with other function.</p>

## Color

<p>Give any color to tag by <code>colorCode</code> prop.</p>
<TagComponent type="color" colors={['red', 'yellow', 'blue', 'purple', 'green']} />

## Tags with limit

<TagComponent type="limit" colors={['red', 'yellow', 'blue', 'purple', 'green']} />

## API

<ApiTable></ApiTable>