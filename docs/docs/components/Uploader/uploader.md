---
id: uploader
title: Uploader
---

import { UploaderComponent } from "./uploader.js"

## Multiple

<p>Choose multiple file.</p>
<UploaderComponent multi={true} />

<p>Choose only one file.</p>
<UploaderComponent multi={false} />

## Limit

<p>Set limit to files.</p>
<UploaderComponent lmt={2} />

## Single

<p>Make the uploader inactive to upload files with <code>single</code> prop.</p>
<UploaderComponent singl={true} />

## Default files

<p>Show default files by giving the files array to <code>defaultFileList</code>.</p>
<UploaderComponent defaultFiles />

## API

<UploaderComponent type="APIuploader" table={[
  ['single', 'boolean', '', 'Make the uploader inactive to upload'],
  ['multiple', 'boolean', 'true', 'Make the uploader able to upload multiple files'],
  ['limit', 'number', '4', 'Limit the number of files to upload'],
  ['defaultFileList*', 'array', '', 'Show default files'],
  ['onChange*', 'function', '','Function of handling uploaded attachments']
]} />