---
id: tabs
title: Tabs
---

import { TabsComponent } from "./tabs.js"

<p>Dynamic tabbed interfaces.</p>
<p><code>handleSelect</code> is triggered when tab is clicked.</p>
<TabsComponent type="before" />

## Example

<p>Simple example of tabs. </p>
<TabsComponent type="id"/>

## Full

<p>Display tab title full length.</p>
<TabsComponent type="full"/>

## Border

<p>Make border darker.</p>
<TabsComponent type="border"/>

## API

### Tabs

<TabsComponent type="APItabs" table={[
['children*', 'React.ReactNode', '', 'Contain TabTitle components'],
['grayborder', 'boolean', '', 'Make border darker'],
['full', 'boolean', '', 'Display context full screen'],
]} />

### TabTitle

<TabsComponent type="APItabtitle" table={[
['children*', 'React.ReactNode', '', 'Shows tab content'],
['onClick', 'function', '', 'Define click handler function'],
['className', 'string', '', 'Define className']
]} />
