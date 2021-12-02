---
id: emptycontent
title: Empty content
---

import { EmptyContentComponent } from "./emptycontent.js"

<p>Give different contents with empty content component.</p>

## Steps

### Example

<p>Simple empty content with title and description. <code>content</code> prop cannot be empty.</p>
<EmptyContentComponent type="simple"/>

### Button

<p>Add button with link by adding <code>url</code> prop to steps array. Hover the button text to see link. </p>
<EmptyContentComponent type="url"/>

### Button text

<p>Add button text by adding <code>urlText</code> prop to steps array.</p>
<EmptyContentComponent type="urltext"/>

### isOutside

<p>Button without link.</p>
<EmptyContentComponent type="out"/>

### Icon

<p>Add icon instead of content number by adding <code>icon</code> prop to steps array.</p>
<EmptyContentComponent type="icon"/>

## Title

<p>Add content title by <code>title</code> prop and description by <code>description</code> prop to content array.</p>
<EmptyContentComponent type="contentTitle"/>

## Url

<p>Add url by <code>url</code> and <code>urlText</code> props to content array.</p>
<EmptyContentComponent type="contenturl"/>

## Vertical

<p>Show content boxes vertically by <code>vertical</code> prop. In this state maxItemWidth will be "420px".</p>
<EmptyContentComponent type="vertical" value={true}/>

## Max width

<p>Declare max width of content box by <code>maxItemWidth</code> prop.</p>
<EmptyContentComponent type="max" value="300px"/>

## API

<EmptyContentComponent type="APIempty" />