---
id: label
title: Label
---

import { LabelComponent } from './label.js'

 ## Style

<p>Use any of the available label style types to quickly create a styled label. Just modify the <code>lblStyle</code> prop.</p>
<LabelComponent type="lblStyle" style={['Default', 'Primary', 'Success', 'Danger', 'Warning', 'Simple']} />

## Color

<p>Wants your own color? Just give color to <code>lblColor</code> prop.</p>
<LabelComponent type="lblColor" style={['red']} />


<!-- ## Classname

<p>Wants your own style? Just create style on your css and declare it to <code>className</code> prop.</p>
<LabelComponent type="className" style={['styled']} /> -->

## Children

<p>Want to declare your value inside the tag? Use <code>children</code> prop.</p>
<LabelComponent type="children" style={['']} />

## API

<LabelComponent type="APIlabel" table={[
    ['lblStyle', 'default | primary | success | danger | warning | simple', 'default', 'label style'], 
    ['lblColor', 'string', '', 'your own color'], 
    ['className', 'string', '', 'your own style'], 
    ['children', 'string', '', 'declare value inside tag'],
]} />