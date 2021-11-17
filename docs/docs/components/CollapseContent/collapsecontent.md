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
  ['contendId', 'string', '', 'Make it able to jump to content'],
  ['* title', 'string', '', 'Defines the title'],
  ['description', 'node', '', 'Place a description under the title'],
  ['open', 'boolean', '', 'Activates open function of container and collapse tag'],
  ['compact', 'boolean', '', 'Set the padding of title container to 20px. Default padding: 20px'],
  ['image', 'string', '','Place an image instead of arrows'],
  ['beforeTitle', 'node','','Show content before the title'],
  ['imageBackground', 'string', '','Change background color of the image'],
]} />