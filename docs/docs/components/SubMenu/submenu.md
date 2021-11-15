---
id: submenu
title: SubMenu
---

import { SubMenuComponent } from "./submenu.js"

## Example

<p>Add multiple sub menu by adding arrays to <code>items</code> prop. </p>
<SubMenuComponent />

## Additional item

<p>Add additional item by <code>additionalMenuItem</code> prop. </p>
<SubMenuComponent add />

## API

<SubMenuComponent type table={[
['items', 'array[]', '', 'Info array of sub menu that will contain title and link'],
['additionalMenuItem', 'node', '', 'Additional sub menu item that will be displayed right side of sub menu ']
]} />
