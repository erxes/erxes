---
id: modifiablelist
title: Modifiable List
---

import { ModifiableListComponent } from "./modifiablelist.js"

## Options

<p>Insert the list by <code>options</code> prop. </p>
<ModifiableListComponent array={["Name", "Age"]} />

## Add button label

<p>Click on the "cancel" button to see 3rd button. Change label of 3rd button by <code>addButtonLabel</code> prop. </p>
<ModifiableListComponent array={["Name", "Age"]} buttonlabel="Custom button label" />

## API

<ModifiableListComponent type="APImodifiablelist" table={[
  ['options*', 'string[]', '', 'Display options on start'],
  ['addButtonLabel', 'string', '"Add an option"', 'Change 3rd button label'],
  ['onChangeOption', 'function', '', 'Define function that runs when delete icon clicked']
]}/>