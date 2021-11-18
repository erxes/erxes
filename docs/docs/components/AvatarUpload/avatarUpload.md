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
