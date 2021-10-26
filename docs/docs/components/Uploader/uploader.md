---
id: uploader
title: Uploader
---

import { UploaderComponent } from "./uploader.js"

## Multiple

<p>Choose multiple file</p>
<UploaderComponent multi={true}></UploaderComponent>

<p>Choose only one file</p>
<UploaderComponent multi={false}></UploaderComponent>

## Limit

<p>Set limit to files</p>
<UploaderComponent lmt={2}></UploaderComponent>

## Single

<p></p>
<UploaderComponent singl={true}></UploaderComponent>

## API

<UploaderComponent type="APIuploader" table={[
  ['single', 'boolean', '', 'single prop'],
  ['multiple', 'boolean', 'true', 'define choose one file or multiple file'],
  ['limit', 'number', '4', 'limit of how many file to choose']
]}></UploaderComponent>