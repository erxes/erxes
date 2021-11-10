---
id: uploader
title: Uploader
---

import { UploaderComponent } from "./uploader.js"

## Multiple

<p>Choose multiple file</p>
<UploaderComponent multi={true} />

<p>Choose only one file</p>
<UploaderComponent multi={false} />

## Limit

<p>Set limit to files</p>
<UploaderComponent lmt={2} />

## Single

<p></p>
<UploaderComponent singl={true} />

## API

<UploaderComponent type="APIuploader" table={[
  ['single', 'boolean', '', 'single prop'],
  ['multiple', 'boolean', 'true', 'define choose one file or multiple file'],
  ['limit', 'number', '4', 'limit of how many file to choose']
]} />