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

## Additional item

<p>Add additional content under the title by <code>additionalItem</code> prop. </p>
<AttachmentComponent additionalItem/>

## Image

<p>Click on picture to see preview.</p>
<AttachmentComponent type="image"/>

<p>Use <code>simple</code> to show only image preview.</p>
<AttachmentComponent type="image" simple/>

## Video

<p>Click on video to preview.</p>
<AttachmentComponent type="video"/>

## Audio

<p>Click on Audio to preview.</p>
<AttachmentComponent type="audio"/>

## Multiple attachments

<p>Add multiple attachments by <code>attachments</code> prop.</p>
<AttachmentComponent type="multi" attachments/>

## Index

<p>Set the file to start from attachments by <code>index</code>. (Index number starts with 0)</p>
<AttachmentComponent type="multi" attachments index/>

## Attachment Gallery

<p>Show a list of attachments with <code>AttachmentGallery</code> components.</p>
<AttachmentComponent type="gallery"/>

### Limit

<p>Set limit to limit the number of attachments to show on start. Default limit is 4.</p>
<AttachmentComponent type="gallery" limit/>

## API

### Attachment

<AttachmentComponent type="APIattachment"/>

### Attachment Gallery

<AttachmentComponent type="APIgallery"/>
