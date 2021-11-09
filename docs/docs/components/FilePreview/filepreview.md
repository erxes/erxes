---
id: filepreview
title: File Preview
---

import {FilePreviewComponent} from "./filepreview.js"

<p>Preview of different kind of files.</p>

## Default file preview

<p>When there is no extension or not supported extension file then it'll go as default.</p>
<FilePreviewComponent url="/home/ariuka/Documents/test"/>

## File preview

<p>Declare file url by <code>fileUrl</code> prop. </p>
<FilePreviewComponent url="/home/ariuka/Documents/test.docx"/>
<p>Add name instead of file url by <code>fileName</code> prop. </p>
<FilePreviewComponent url="/home/ariuka/Documents/test.xlsx" name="test.xlsx"/>

## Picture and Video preview

<p>Preview jpeg, jpg, gif, png of extension picures and mp4 video.</p>
<FilePreviewComponent url="https://erxes.io/static/images/logo/logo_dark_3x.png" />
<FilePreviewComponent url="/home/ariuka/Documents/test.mp4" />

## API

<FilePreviewComponent type="APIfilepreview" table={[
  ['* fileUrl', 'string', '', 'Url of file. Supported types are docx, pptx, xlsx, mp4, jpeg, jpg, gif, png, zip, csv, doc, ppt, psd, avi, txt, rar, mp3, pdf, xls'],
  ['fileName', 'string', '', 'File name that will displayed instead of file url']
]} />