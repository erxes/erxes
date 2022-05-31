---
id: collapsecontent
title: Collapse Content
---

import { CollapseContentComponent } from "./collapsecontent.js"

## Simple

<p>Simplest collapse content have title and children.</p>
<CollapseContentComponent />

## Description

<p>Add description by <code>description</code> prop. </p>
<CollapseContentComponent type="desc" text="Description"/>

## Image

<p>Add image by <code>image</code> prop. </p>
<CollapseContentComponent img="https://erxes.io/static/images/logo/logo_dark.svg" />

## Image background color

<p>Add image background color by <code>imageBackground</code> prop. </p>
<CollapseContentComponent img="https://erxes.io/static/images/logo/logo_dark.svg" color="yellow"/>

## Before title

<p>Add something before title by <code>beforeTitle</code> prop. </p>
<CollapseContentComponent type ="icon" text="O"/>

## ContendId

<p>Use <code>contentId</code> for jump to content.</p>
<CollapseContentComponent type="contentid" text="contendId"/>

## Compact

<p>Set the padding of the title conteiner to '10px 20px' by adding <code>compact</code> prop. Default padding: 20px</p>
<CollapseContentComponent comp />

## Open

<p>Activates open function of container and collapse tag by <code>open</code> prop. </p>
<CollapseContentComponent opens />

## API

<CollapseContentComponent type="APIcollapsecontent" table={[
  ['contendId', 'string', '', 'Jump to content'],
  ['title*', 'string', '', 'Define title'],
  ['children*', 'React.ReactNode', '', 'Declare content'],
  ['description', 'React.ReactNode', '', 'Description that will be displayed under title'],
  ['open', 'boolean', '', 'Activates open function of container and collapse tag'],
  ['compact', 'boolean', '20px', 'Define height of title container'],
  ['image', 'string', '','Image that will be placed instead of arrows'],
  ['beforeTitle', 'React.ReactNode','','React node that will be placed left side of title'],
  ['onClick', 'function', '', 'Define click handler function'],
  ['imageBackground', 'string', '','Background color of image'],
  ['id', 'string', '', 'Gives id to collapse content']
]} />