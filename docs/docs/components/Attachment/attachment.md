---
id: attachment
title: Attachment
---

import { AttachmentComponent } from "./attachment.js"

<p>Add any type of attachment or attachments with preview. Click logo or picture to preview.</p>

## Example

<p>Add attachment with preview.</p>
<AttachmentComponent />

## Size

<p>Add file size by adding <code>size</code> prop to attachment information array.</p>
<AttachmentComponent type="fileSize"/>

## Image

<p>Click on picture to see preview.</p>
<AttachmentComponent type="image"/>

<p>Use <code>simple</code> to see only image preview.</p>
<AttachmentComponent type="image" simple/>

## Video

<p>.</p>
<AttachmentComponent type="video"/>

## Additional item

<p>Add additional item by <code>additionalItem</code> prop. </p>
<AttachmentComponent additionalItem/>

<!-- ## Multiple attachments

<p>Add multiple attachments by <code>attachments</code> prop.</p>
<AttachmentComponent type="multi"/> -->

## API

<AttachmentComponent type="APIattachment"/>