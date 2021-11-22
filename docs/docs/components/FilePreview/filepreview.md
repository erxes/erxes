---
id: filepreview
title: File Preview
---

import {FilePreviewComponent} from "./filepreview.js"

<p>Preview of different kind of files.</p>

## Default file preview

<p>When there is no extension or not supported extension file then it'll go as default.</p>
<FilePreviewComponent url="test"/>

## File preview

<p>Declare file url by <code>fileUrl</code> prop. </p>
<FilePreviewComponent url="test.docx"/>
<p>Add name instead of file url by <code>fileName</code> prop. </p>
<FilePreviewComponent url="test.xlsx" name="test"/>
<p>File extention name is displayed in front of blank page icon.</p>
<FilePreviewComponent url="test.zip"/>

## Picture and Video preview

<p>Preview jpeg, jpg, gif, png of extension picures and mp4 video.</p>
<FilePreviewComponent url="https://erxes.io/static/images/logo/logo_dark_3x.png" />
<FilePreviewComponent url="test.mp4" />

## API

<FilePreviewComponent type="APIfilepreview" table={[
  ['* fileUrl', 'string', '', 'Define url of file. Supported types: docx, pptx, xlsx, mp4, jpeg, jpg, gif, png, zip, csv, doc, ppt, psd, avi, txt, rar, mp3, pdf, xls'],
  ['fileName', 'string', '', 'Show file name instead of the url']
]} />