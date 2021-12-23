---
id: typography
title: Typography
---

import { TypoComponent } from "./typography.js"

<p>It includes a large amount of font size, weight and line heights.</p>

## Import

<p>Import <code>typography</code> from erxes-ui to use our main font sizings in your project.</p>
<TypoComponent type="import" />

## Font weight

<p>Choose font weight from below to define '300px', '400px', '500px'. Click to copy weight name.</p>
<TypoComponent typographies={['fontWeightLight', 'fontWeightRegular', 'fontWeightMedium']} />

## Font Size

<p>Choose font weight from below to define heading size from 1 to 8, body and uppercase sizes. Click to copy sizing name.</p>
<TypoComponent typographies={['fontSizeHeading1', 'fontSizeHeading2', 'fontSizeHeading3', 'fontSizeHeading4', 'fontSizeHeading5', 'fontSizeHeading6', 'fontSizeHeading7', 'fontSizeHeading8', 'fontSizeBody', 'fontSizeUppercase']} />

## Line Height

<p>Choose line height from below to define 1px to 1.5px. Click to copy height name.</p>
<TypoComponent typographies={['lineHeightHeading1', 'lineHeightHeading2', 'lineHeightHeading3', 'lineHeightHeading4', 'lineHeightHeading5', 'lineHeightHeading6', 'lineHeightHeading7', 'lineHeightHeading8', 'lineHeightBody', 'lineHeightUppercase']} />
