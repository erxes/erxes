---
id: datawithloader
title: Data with loader
---

import { DatawithLoaderComponent } from "./datawithloader.js"

## Loading

<p>When loading is "true" it shows spinner or loading content, and when it's "false" it shows data. </p>
<DatawithLoaderComponent type="loadtrue" />
<DatawithLoaderComponent type="loadingcontent" text="Loading..."/>
<DatawithLoaderComponent type="loadfalse" />

## Count

<p>When count is "0" it shows empty content or empty state. </p>

### Empty content

<DatawithLoaderComponent type="count" counter={0} image="info-circle" text="This is empty content"/>

### Empty state

<p>You can costumize the empty state by giving text (with <code>emptyText</code>), icon (with <code>emptyIcon</code>). And also change the icon size with <code>size</code> prop.</p>
<DatawithLoaderComponent type="emptystate" counter={0} image="info-circle" text="Empty state" sizes="small"/>

## API

<DatawithLoaderComponent type="APIdatewithloader" table={[
['* data', 'any', '', 'Define data'],
['count', 'any', '', 'Define count'],
['* loading', 'boolean', '', 'Loading state'],
['emptyText','string', 'There is no data', 'Text of emptyState'],
['emptyIcon','string','','Icon of emptyState'],
['emptyImage','string','','Image of emptyState'],
['size','string','full','Size of icon in emptyState'],
['objective','boolean','false','Make the spinner objective'],
['emptyContent','React.ReactNode','','Content when count is "0"'],
['loadingContent','React.ReactNode', '','Content when loading is "true"']
]} />
