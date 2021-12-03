---
id: textinfo
title: Text info
---

import { TextInfoComponent } from "./textinfo.js"

## Types

<p>Change text style by <code>textStyle</code> prop.</p>
<TextInfoComponent type="textStyle" style={['primary', 'success', 'danger', 'warning', 'simple']}></TextInfoComponent>

## Size

<p>Add <code>hugeness</code> for additional sizes.</p>
<TextInfoComponent  type="hugeness" style={["big", "small"]}></TextInfoComponent>

## API

<TextInfoComponent type="APItextinfo" table={[
['children*', 'React.ReactNode | string', '', 'Define the text to show'],
['ignoreTrans', 'boolean', '', 'Ignores translation'],
['textStyle', 'primary | success | danger | warning | simple', 'default', 'Style the text'],
['hugeness', 'string', 'small', 'Set the size of the text']
]}></TextInfoComponent>
