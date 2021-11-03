---
id: textinfo
title: Text info
---

import { TextInfoComponent } from "./textinfo.js"

<p>Change text style by <code>textStyle</code> prop.</p>
<TextInfoComponent type="textStyle" style={['default', 'primary', 'success', 'danger', 'warning', 'simple']}></TextInfoComponent>

## Size

<p>Change size by <code>huganess</code> prop. </p>
<TextInfoComponent  type="hugeness" style={["big", "small"]}></TextInfoComponent>

## API

<TextInfoComponent type="APItextinfo" table={[
['children', 'node', '', 'text or text container'],
['textStyle', 'string', 'default', 'put style to text'],
['hugeness', 'string', 'small', 'choose hugeness of the text']
]}></TextInfoComponent>
