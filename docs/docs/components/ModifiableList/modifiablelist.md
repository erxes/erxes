---
id: modifiablelist
title: Modifiable List
---

import { ModifiableListComponent } from "./modifiablelist.js"

## Options

<p>Insert list by <code>options</code> prop. </p>
<ModifiableListComponent array={["Name", "Age"]} />

## Add button label

<p>Push cancel button to see 3rd button. Change label of 3rd button by <code>addButtonLabel</code> prop. </p>
<ModifiableListComponent array={["Name", "Age"]} buttonlabel="button" />

## API

<ModifiableListComponent type="APImodifiablelist" table={[
  ['options', 'string[]', '', 'list of array'],
  ['addButtonLabel', 'string', 'Add an option', 'label of 3rd button']
]}/>