---
id: icon
title: Icon
---

import { IconComponent } from "./icon.js"

<p>To display desired icon write it's name to <code>icon</code> prop.</p> 
<IconComponent type="icon" iconName="envelope-alt" />

## Color

<p>Gives color to icon by <code>color</code> prop.</p>
<IconComponent type="color" iconName="envelope-alt" colors="red"/>

## Size

<p>Change icon size by <code>size</code> prop.</p>
<IconComponent type="size" iconName="envelope-alt" sizes={30}/>

## Active

<p>When it's active it'll display black icon.</p>
<IconComponent type="active" iconName="envelope-alt" colors="red" active={true}/>

## API

<IconComponent type="APIicon" table={[
  ['* icon', 'string', '', 'Icon name'],
  ['size', 'number', '', 'Changes icon size'],
  ['color', 'string', 'black', 'Changes icon color'],
  ['isActive', 'boolean', 'false', 'Change icon color to black']
]}/>
