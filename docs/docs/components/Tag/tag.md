---
id: tag
title: Tags
---

import { TagComponent, ApiTable } from "./tag.js"

<p>Use <code>_id</code> and <code>name</code> props for connecting with other function.</p>
<TagComponent tag={[
{ _id: "tag", type: "default", name: "tagname1", colorCode: "red" },
{ _id: "tag", type: "default", name: "tagname2", colorCode: "yellow" },
{ _id: "tag", type: "default", name: "tagname3", colorCode: "blue" }
]}></TagComponent>

## Tags with limit

<TagComponent tag={[
{ _id: "tag", type: "default", name: "tagname1", colorCode: "red" },
{ _id: "tag", type: "default", name: "tagname2", colorCode: "yellow" },
{ _id: "tag", type: "default", name: "tagname3", colorCode: "blue" },
{ _id: "tag", type: "default", name: "tagname3", colorCode: "blue" },
{ _id: "tag", type: "default", name: "tagname3", colorCode: "blue" },
{ _id: "tag", type: "default", name: "tagname3", colorCode: "blue" },
{ _id: "tag", type: "default", name: "tagname3", colorCode: "blue" },
]} lmt={3}></TagComponent>

## API

<ApiTable></ApiTable>