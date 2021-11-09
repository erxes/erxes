---
id: textinfo
title: Text info
---

import { TextInfoComponent } from "./textinfo.js"

<p>Change text style by <code>textStyle</code> prop.</p>
<TextInfoComponent type="textStyle" style={['default', 'primary', 'success', 'danger', 'warning', 'simple']}></TextInfoComponent>

## Size

<p>Add <code>huganess</code> for additional sizes</p>
<TextInfoComponent  type="hugeness" style={["big", "small"]}></TextInfoComponent>

## API

<TextInfoComponent type="APItextinfo" table={[
['textStyle', 'string', 'default', 'put style to text'],
['hugeness', 'string', 'small', 'choose hugeness of the text']
]}></TextInfoComponent>
