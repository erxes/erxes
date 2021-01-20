---
id: import
title: Import
sidebar_label: Import
---

This document details how to import data.

## Import

If you are migrating from other systems or have a need to export the data you have collected, here's the place.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/general-settings/importHistory-list.png)

1. Available data types
2. Import history attempt list
3. Control buttons

You can import & export the following types of data:

| Data type | Import | Export |
| ------------- | :-----------: | :-----: |
| Brands | No | **Yes** |
| Channels | No | **Yes** |
| Companies | **Yes** | **Yes** |
| Customers | **Yes** | **Yes** |
| Sales pipelines | **Yes** | **Yes** |
| Permissions | No | **Yes** |
| Product & service | **Yes** | No |
| Tasks | **Yes** | **Yes**
| Tickets | **Yes** | **Yes** |
| Team members | No | **Yes** |

All data types that can be imported have spreadsheet template files available for download. You must download & fill the template accordingly before importing.

When filling templates, consider the following:
  - You must not change the column names of the template
  - You must fill in proper values. For example, when a field requires number, you must fill numbers
  - When fields require the name(s) of things that should be previously saved (customersPrimaryNames, companiesPrimaryNames, boardName, pipelineName, stageName etc, you must fill in the exact names of things)
  - When fields require predefined values, you must fill one of the valid values given in the tables below.

The following tables describe all available fields to be imported.

#### 1. Companies template

| Field name | Field type | Description |
| ------------- | :-----------: | -------------- |
| primaryName | string | Primary name of the company
| size | number | Company size
| doNotDisturb | boolean | Do not disturb
| plan | string | Plan
| industry | string | Industry
| primaryEmail | string | Primary email
| primaryPhone | string | Primary phone number
| businessType | string | One of "Competitor", "Customer", "Investor", "Partner", "Press", "Prospect", "Reseller", "Other" or an empty value
| description | string | Description
| customersPrimaryNames | string | Names separated by comma. These names must match the name of customers that are already registered in erxes

#### 2. Customers template

| Field name | Field type | Description |
| ------------- | :-----------: | -------------- |
| firstName | string | First name
| lastName | string | Last name
| primaryEmail | string | Primary email
| primaryPhone | string | Primary phone number
| position | string | Position
| department | string | Department
| leadStatus | string | One of "new", "attemptedToContact", "inProgress", "badTiming", "unqualified" or an empty value
| hasAuthority | boolean | Has authority
| description | string | Description
| doNotDisturb | boolean | Do not disturb |
| ownerEmail | string | Email address of the owner |
| tag | string | Tag name that has already been registered in erxes |
| companiesPrimaryNames | string | Names separated by comma. These names must match the name of companies that are already registered in erxes |

#### 3. Product & service template

| Field name | Field type | Description |
| ------------- | :-----------: | -------------- |
| name | string | Name
| type | string | One of "product" or "service"
| categoryCode | string | Category code
| description | string | Description
| sku | string | Stock keeping unit
| code | string | Code
| unitPrice | number | Unit price


Customers, companies, product & services have custom field attributes which can be set from "Settings -> Properties".

![](https://erxes-docs.s3-us-west-2.amazonaws.com/general-settings/customProperty.png)

If you want these custom attributes to be imported, then you must include the name of the attribute as a column in the template. For example, if you needed to import a custom property named **"DealCount"**, then you add **"DealCount"** to the customer template. This name has to be **exactly the same & case-sensitive**.

#### 4. Deal/Task/Ticket template

| Field name | Field type | Description |
| ------------- | :-----------: | -------------- |
| order | number | Order in the stage
| name | string | Name
| closeDate | date | Close date
| isComplete | boolean | Completeness
| description | string | Description
| companiesPrimaryNames | string | Names separated by comma. These names must match the name of companies that are already registered in erxes
| customersPrimaryNames | string | Names separated by comma. These names must match the name of customers that are already registered in erxes
| boardName | string | The exact name of board it belongs
| pipelineName | string | The exact name of pipeline it belongs
| stageName | string | The exact name of stage it belongs

### Import histories detail

![](https://s3.us-west-2.amazonaws.com/erxes-docs/general-settings/importhistory2.png)

1. Import history's progress par by percentage
2. Error messages

### Importing in the background

![](https://s3.us-west-2.amazonaws.com/erxes-docs/general-settings/importhistory3.png)

1. You can see the importing process percentage while browsing other modules. This is a background process.