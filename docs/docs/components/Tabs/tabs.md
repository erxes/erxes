---
id: tabs
title: Tabs
---

import { TabsComponent } from "./tabs.js"

<p>Click on Tabs to see the context. Declare this code before return.</p>
<TabsComponent type="before"/>

## Example

<p>Simple example of tabs. </p>
<TabsComponent />

## Full

<p>Display context full screen.</p>
<TabsComponent type="full"/>


## Border

<p>Make border darker.</p>
<TabsComponent type="border"/>

## API

<TabsComponent type="APItabs" table={[
  ['grayBorder', 'boolean', '', 'Make border darker'],
  ['full', 'boolean', '', 'Display context full screen'],
]} />
