---
id: introduction
title: Introduction
---

import { Examples } from './introduction.js'

<p>We transfered the common ui into common components. We use them on erxes, erxes plugins and our enterprize companies. This tab includes everything that you can learn about erxes-ui common components, utilities, erxes-icon and so on.</p>

## Installation

<p>If you wish to use our common components in your project, we have npm package named "erxes-ui" which you can install with: </p>
<Examples type="installNPM" />
<Examples type="installYARN" />

## Work on erxes-ui

<p>First and foremost, If you're planning to work on erxes-ui and try it on your own project, you have to clone erxes-ui from the following repository on github. (It has to be cloned in the same folder with your project!)</p>
<Examples type="clone" />

<p>The changes wouldn't automatically run on your project after you made it. You have to delete the <code>lib</code> folder and add it again. In short:</p>
<Examples type="erxes-ui" />

<p>If you want more details in Mongolian, click <a href="https://culture.erxes.mn/knowledge-base/article/detail?catId=Boi5KHCnjdncLSJxc&_id=rRFqeG5czQwNR7uoC">here</a>.</p>


## Importing a Component

<p>While you can still use require() and module.exports, we encourage you to use import and export instead.</p>
<p>Import paths are displayed in the API section of each component.</p>

<Examples type="import" />