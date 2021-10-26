---
id: textinfo
title: Text info
---

import { TextInfoComponent } from "./textinfo.js"

<p>Change text style by <code>textStyle</code> and <code>hugeness</code> props.</p>
<TextInfoComponent style={['default', 'primary', 'success', 'danger', 'warning', 'simple']}></TextInfoComponent>

## API

<TextInfoComponent type="APItextinfo" table={[
  ['children', 'node', '', 'text or text container'],
  ['ignoreTrans', 'boolean', '', 'translate text'],
  ['textStyle', 'string', 'default', 'put style to  text'],
  ['hugeness', 'string', 'small', 'choose hugeness of the text']
  ]}></TextInfoComponent>