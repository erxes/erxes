---
id: sortablelist
title: Sortable list
---

import { SortableListComponent } from "./sortablelist.js"

<p>You can sort the list with drag and drop actions.</p>
<SortableListComponent />

## API

<SortableListComponent type="APIsortablelist" table={[
  ['* field', 'any[]', '', 'List properties'],
  ['showDragHandler', 'boolean', 'true', 'Activates hand  cursor'],
  ['isDragDisabled', 'boolean', '', 'Activates drag'],
  ['droppableId', 'string', '', 'Droppable Id']
]} />