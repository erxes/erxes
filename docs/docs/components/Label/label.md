---
id: label
title: Label
---

import { LabelComponent } from './label.js'

## Style

<p>Use any of the available label style types to quickly create a styled label. Just modify the <code>lblStyle</code> prop.</p>
<LabelComponent type="lblStyle" style={['default', 'primary', 'success', 'danger', 'warning', 'simple']} />

## Color

<p>Want your own color? Just give color to <code>lblColor</code> prop.</p>
<LabelComponent type="lblColor" style={['red']} />

## API

<LabelComponent type="APIlabel" table={[
['lblStyle', 'default | primary | success | danger | warning | simple', 'default', 'Set styles of label'],
['lblColor', 'string', '', 'Gives custom color'],
['children*', 'React.ReactNode | string', '', 'Declare label text'],
['className', 'string', '', 'Defines className'],
['shake', 'boolean', '', 'Activate shake animation'],
['ignoreTrans', 'boolean', '', 'Ignores translate']
]} />
