---
id: modaltrigger
title: Modal Trigger
---

import { ModalComponent } from "./modaltrigger.js"

<p>Add dialogs to your site for lightboxes, user notifications, or completely custom content.</p>

## Example

<p>Simple modal trigger without any aditional props. Click the button below to try it.</p>
<ModalComponent />

## Title

<p>Show title on the header section of the modal with <code>title</code> prop.</p>
<ModalComponent type="title" />

## Backdrop

<p>Make the modal not closeable when clicking outside it by setting <code>backdrop</code> to 'static'.</p>
<ModalComponent type="backDrop" />

## Padding

<p>Make the padding less by setting <code>paddingContent</code> to 'less-padding'.</p>
<ModalComponent type="paddingContent" />

## Hide header

<p>Hide the header section of the modal with <code>hideHeader</code> prop.</p>
<ModalComponent type="hideHeader" />

## API

<ModalComponent type="APImodal" table={[
  ['title*', 'string', '', 'Show title on header section of the modal' ],
  ['trigger', 'React.ReactNode', '', 'Define the trigger item' ],
  ['autoOpenKey', 'React.ReactNode', '', '' ],
  ['content*', 'React.ReactNode', '', 'Define the function that contains the modal content' ],
  ['size', 'sm | lg | xl', '', 'Render a large, extra large or small modal. When not provided, the modal is rendered with medium (default) size' ],
  ['ignoreTrans', 'boolean', '', 'Ignore translations' ],
  ['dialogClassName', 'string', '', 'Define className for dialog' ],
  ['backDrop', "'static' | boolean", 'true', "Specify 'static' for a backdrop that doesn't trigger an 'onHide' when clicked" ],
  ['enforceFocus', 'boolean', 'true', 'When true The modal will prevent focus from leaving the Modal while open. Consider leaving the default value here, as it is necessary to make the Modal work well with assistive technologies, such as screen readers' ],
  ['hideHeader', 'boolean', '', 'Hide the header section' ],
  ['isOpen', 'boolean', '', 'Show the dialog on start' ],
  ['history*', 'any', '', '' ],
  ['paddingContent', "'less-padding'", '', 'Decrease the padding' ],
  ['centered', 'boolean', '', 'Vertically center the dialog in the window' ],
  ['onExit', 'function', '', 'Callback fired right before the Modal transitions out' ],
  ['isAnimate', 'boolean', '', 'Open and close the Modal with a slide and fade animation.' ],
]} />
