---
id: avatarUpload
title: Avatar Upload
---

import { AvatarComponent } from "./avatarUpload.js"

<p>Upload an avatar by clicking on the them.</p>

## Default avatar

<p>Set default avatar with <code>defaultAvatar</code> prop.</p>
<AvatarComponent type="defaultAvatar" />

## Avatar

<p>When you upload an avatar, it shows the avatar instead of default avatar.</p>
<AvatarComponent type="avatar" />

## API

<AvatarComponent type="APIavatarUpload" table={[
    ['defaultAvatar', 'string', 'button', 'Set default avatar'],
    ['avatar', 'string', '', 'Set an avatar']
]} />

<!-- ## Example

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

## API

<AttachmentComponent type="APIattachment"/> -->