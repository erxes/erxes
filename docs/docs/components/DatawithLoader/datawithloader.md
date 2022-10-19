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

#### Icon

<p>You can costumize the empty state by giving text (with <code>emptyText</code>), icon (with <code>emptyIcon</code>). And also change the icon size with <code>size</code> prop.</p>
<DatawithLoaderComponent type="emptystateicon" counter={0} image="info-circle" text="Empty state" sizes="small"/>

#### Image

<p>You can costumize the empty state by giving text (with <code>emptyText</code>), image (with <code>emptyImage</code>).  </p>
<DatawithLoaderComponent type="emptystateimage" counter={0} image="https://erxes.io/static/images/logo/logo_dark.svg" text="Empty state"/>

## API

<DatawithLoaderComponent type="APIdatewithloader" table={[
['data*', 'any', '', 'Define data'],
['count', 'any', '', 'Define count'],
['loading*', 'boolean', '', 'Loading state'],
['emptyText','string', 'There is no data', 'Define text of emptyState'],
['emptyIcon','string','','Define icon of emptyState'],
['emptyImage','string','','Define image of emptyState'],
['size','string','full','Define size of icon in emptyState'],
['objective','boolean','false','Make the spinner objective'],
['emptyContent','React.ReactNode','','Define content when count is "0"'],
['loadingContent','React.ReactNode', '','Define content when loading is "true"']
]} />
