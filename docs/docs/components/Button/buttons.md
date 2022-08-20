---
id: buttons
title: Buttons
---

import { ButtonComponent } from "./buttons.js"

<p>Custom button styles for actions in forms, dialogs, and more with support for multiple sizes, states, and more.</p>

## Examples

### Types

<p>Use any of the available button style types to quickly create a styled button. Just modify the <code>btnStyle</code> prop.</p>
<ButtonComponent type="btnStyle" buttons={['Primary', 'Success', 'Danger', 'Warning', 'Simple', 'Link']} />

### Sizes

<p>Larger or smaller buttons? Add <code>size</code> for additional sizes.</p>
<ButtonComponent type="size" buttons={['Large', 'Medium', 'Small']} />

## Disabled state

<p>Make buttons look inactive by adding <code>disabled</code> prop.</p>
<ButtonComponent type="disabled" buttons={['Disabled']} />

## Uppercase

<p>Make button text uppercase by adding <code>uppercase</code> prop.</p>
<ButtonComponent type="uppercase" buttons={['Uppercase']} />

## Block

<p>Make button full-width by adding <code>block</code> prop.</p>
<ButtonComponent type="block" buttons={['Block']} />

## Icon

<p>Add your favorite icon by using the <code>icon</code> prop.</p>
<ButtonComponent type="icon" buttons={['Primary', 'Success', 'Danger', 'Warning', 'Simple', 'Link']} icons={['envelope-alt', 'check-circle', 'times-circle', 'exclamation-triangle', 'info-circle', 'link']} />

## API

<ButtonComponent type="APIbutton" table={[
['children', 'React.ReactNode', '', 'Shows button text'],
['className', 'string', '', 'Define className'],
['onClick', 'function', '', 'Define click handler for button element'],
['onMouseDown', 'function', '', 'Trigger fuction while mouse is clicked'],
['href', 'string', '', 'Define a hyperlink'],
['type', 'string', 'button', 'Define HTML button type attribute'],
['btnStyle', 'primary | success | danger | warning | simple | link', 'default', 'One or more button style combinations'],
['size', 'large | medium | small', 'medium', 'Specifies a large or small button'],
['disabled', 'boolean', 'false', 'Disables the Button'],
['ignoreTrans', 'boolean', '', 'Ignore translations'],
['block', 'boolean', 'false', 'Make the button full-width'],
['icon', 'string', '', 'Shows icon'],
['style', 'any', '', 'Add custom style to button'],
['id', 'string', '', 'Gives id to button'],
['uppercase', 'boolean', 'false', 'Make the button text uppercase'],
['target', 'string', '', 'Define the target']
]} />
