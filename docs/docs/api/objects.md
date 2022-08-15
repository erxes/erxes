---
id: objects
title: Objects
slug: objects
sidebar_position: 4
---

## Action

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
config<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
nextActionId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
style<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ActivityLog

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentDetail<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeDetail<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdByDetail<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ActivityLogByAction

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeDetail<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ActivityLogByActionResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
activityLogs<br />
<a href="/api/objects#activitylogbyaction"><code>[ActivityLogByAction]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## App

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
accessToken<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
expireDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isEnabled<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
refreshToken<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userGroupId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userGroupName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Attachment

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
duration<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Automation

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
actions<br />
<a href="/api/objects#action"><code>[Action]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggers<br />
<a href="/api/objects#trigger"><code>[Trigger]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## AutomationHistory

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
actions<br />
<a href="/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
automationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
nextActionId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startWaitingDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
target<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
targetId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggerConfig<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
waitingActionId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## AutomationNote

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
actionId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## AutomationResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
responseId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sessionCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## AutomationsListResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#automation"><code>[Automation]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsTotalCountResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
byStatus<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
total<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## AvgEmailStats

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avgBouncePercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgClickPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgComplaintPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgDeliveryPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgOpenPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgRejectPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgRenderingFailurePercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avgSendPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
total<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Board

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelines<br />
<a href="/api/objects#pipeline"><code>[Pipeline]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## BoardCount

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## BookingData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
bookingFormText<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryTree<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
displayBlock<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mainProductCategory<br />
<a href="/api/objects#productcategory"><code>ProductCategory</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
navigationText<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCategoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productFieldIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
style<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userFilters<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
viewCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## BookingProduct

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
fields<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
product<br />
<a href="/api/objects#product"><code>Product</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Branch

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
address<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/api/objects#branch"><code>[Branch]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coordinate<br />
<a href="/api/objects#coordinate"><code>Coordinate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parent<br />
<a href="/api/objects#branch"><code>Branch</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisor<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
users<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Brand

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailConfig<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Callout

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
body<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buttonText<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
featuredImage<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## CatProd

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Channel

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrations<br />
<a href="/api/objects#integration"><code>[Integration]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
members<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
openConversationCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Chat

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSeen<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastMessage<br />
<a href="/api/objects#chatmessage"><code>ChatMessage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participantUsers<br />
<a href="/api/objects#chatuser"><code>[ChatUser]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChatMessage

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isPinned<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mentionedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relatedMessage<br />
<a href="/api/objects#chatmessage"><code>ChatMessage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
seenList<br />
<a href="/api/objects#seeninfo"><code>[SeenInfo]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChatMessageResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#chatmessage"><code>[ChatMessage]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChatResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#chat"><code>[Chat]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChatTypingStatusChangedResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
chatId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChatUser

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
details<br />
<a href="/api/objects#chatuserdetails"><code>ChatUserDetails</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAdmin<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChatUserDetails

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avatar<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fullName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
operatorPhone<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Checklist

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/api/objects#checklistitem"><code>[ChecklistItem]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
percent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ChecklistItem

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
checklistId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isChecked<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ClientPortal

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dnsStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
domain<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
footerHtml<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
googleCredentials<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headerHtml<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kbToggle<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
knowledgeBaseLabel<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
knowledgeBaseTopicId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerBrandCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mobileResponsive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
otpConfig<br />
<a href="/api/objects#otpconfig"><code>OTPConfig</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
publicTaskToggle<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
styles<br />
<a href="/api/objects#styles"><code>Styles</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskBoardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskLabel<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskPipelineId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskPublicBoardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskPublicPipelineId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskStageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskToggle<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketBoardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketLabel<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketPipelineId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketStageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketToggle<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ClientPortalUser

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
clientPortal<br />
<a href="/api/objects#clientportal"><code>ClientPortal</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
clientPortalId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
company<br />
<a href="/api/objects#company"><code>Company</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyRegistrationNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
erxesCompanyId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
erxesCustomerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isEmailVerified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isPhoneVerified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersListResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#clientportaluser"><code>[ClientPortalUser]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ColumnConfigItem

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Comment

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
childCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
comment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## CommentResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#comment"><code>[Comment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## CompaniesListResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#company"><code>[Company]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Company

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avatar<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
businessType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/objects#customer"><code>[Customer]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emails<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getTags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
industry<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
location<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mergedIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
names<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCompany<br />
<a href="/api/objects#company"><code>Company</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCompanyId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phones<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
plan<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryEmail<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryPhone<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
trackedData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
website<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Config

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Conformity

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Conversation

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bookingProductId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
callProAudio<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
facebookPost<br />
<a href="/api/objects#facebookpost"><code>FacebookPost</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
idleTime<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integration<br />
<a href="/api/objects#integration"><code>Integration</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isFacebookTaggedMessage<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messageCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messages<br />
<a href="/api/objects#conversationmessage"><code>[ConversationMessage]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
operatorStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participatedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participatedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participatorCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
readUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
videoCallData<br />
<a href="/api/objects#videocalldata"><code>VideoCallData</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConversationAdminMessageInsertedResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unreadCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConversationChangedResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConversationClientTypingStatusChangedResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConversationDetailResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isOnline<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messages<br />
<a href="/api/objects#conversationmessage"><code>[ConversationMessage]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
operatorStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participatedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supporters<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConversationFacebookData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
postId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
senderId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
senderName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConversationMessage

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bookingWidgetData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
botData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
engageData<br />
<a href="/api/objects#engagedata"><code>EngageData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formWidgetData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromBot<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
internal<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCustomerRead<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mailData<br />
<a href="/api/objects#maildata"><code>MailData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mentionedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerAppData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
videoCallData<br />
<a href="/api/objects#videocalldata"><code>VideoCallData</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ConvertTo

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dealUrl<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskUrl<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketUrl<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Coordinate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
latitude<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
longitude<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Customer

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avatar<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
birthDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/objects#company"><code>[Company]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversations<br />
<a href="/api/objects#conversation"><code>[Conversation]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailValidationStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emails<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getTags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasAuthority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integration<br />
<a href="/api/objects#integration"><code>Integration</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isOnline<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastSeenAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
location<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
middleName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneValidationStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phones<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
position<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryEmail<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryPhone<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
remoteAddress<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sessionCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sex<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
state<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
trackedData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
urlVisits<br />
<a href="/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorContactInfo<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## CustomerConnectionChangedResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## CustomersListResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#customer"><code>[Customer]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Dashboard

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
childsDashboard<br />
<a href="/api/objects#dashboard"><code>[Dashboard]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dashboardCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relatedIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
selectedMemberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DashboardItem

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dashboardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDateRange<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
layout<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vizState<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Deal

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
amount<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/objects#company"><code>[Company]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/objects#customer"><code>[Customer]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/objects#pipelinelabel"><code>[PipelineLabel]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paymentsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipeline<br />
<a href="/api/objects#pipeline"><code>Pipeline</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
products<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/objects#stage"><code>Stage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timeTrack<br />
<a href="/api/objects#timetrack"><code>TimeTrack</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DealListItem

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
amount<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
products<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relations<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DealTotalCurrency

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
amount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DeliveryList

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#smsdelivery"><code>[SmsDelivery]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DeliveryReport

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
engage<br />
<a href="/api/objects#engagemessage"><code>EngageMessage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mailId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Department

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
childCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
children<br />
<a href="/api/objects#department"><code>[Department]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parent<br />
<a href="/api/objects#department"><code>Department</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisor<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
users<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Donate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaign<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
donateScore<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DonateCampaign

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
donatesCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
maxScore<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## DonateMain

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#donate"><code>[Donate]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Email

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EmailDelivery

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bcc<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cc<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromEmail<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subject<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EmailDeliveryList

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#emaildelivery"><code>[EmailDelivery]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EmailTemplate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EngageData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sentAs<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EngageDeliveryReport

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#deliveryreport"><code>[DeliveryReport]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EngageLog

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
engageMessageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
message<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EngageMessage

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/objects#brand"><code>Brand</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brands<br />
<a href="/api/objects#brand"><code>[Brand]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUserName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerTagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerTags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromIntegration<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getTags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDraft<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastRunAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logs<br />
<a href="/api/objects#engagelog"><code>[EngageLog]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messenger<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerReceivedCustomerIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
method<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
runCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleDate<br />
<a href="/api/objects#engagescheduledate"><code>EngageScheduleDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segments<br />
<a href="/api/objects#segment"><code>[Segment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shortMessage<br />
<a href="/api/objects#engagemessagesms"><code>EngageMessageSms</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
smsStats<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stats<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stopDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCustomersCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
validCustomersCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EngageMessageSms

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromIntegrationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## EngageScheduleDate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dateTime<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
day<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
month<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ENV

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
USE_BRAND_RESTRICTIONS<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Error

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fieldId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Exm

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
appearance<br />
<a href="/api/objects#exmappearance"><code>ExmAppearance</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
features<br />
<a href="/api/objects#exmfeature"><code>[ExmFeature]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
welcomeContent<br />
<a href="/api/objects#exmwelcomecontent"><code>[ExmWelcomeContent]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmAppearance

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
primaryColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
secondaryColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmCeremonyData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
howManyYear<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
willDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
year<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmEventData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
goingUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
interestedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
where<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmFeature

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subContentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmFeed

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ceremonyData<br />
<a href="/api/objects#exmceremonydata"><code>ExmCeremonyData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
commentCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eventData<br />
<a href="/api/objects#exmeventdata"><code>ExmEventData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eventGoingUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eventInterestedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
heartCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
images<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isHearted<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLiked<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isPinned<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
likeCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipients<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
where<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmFeedResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#exmfeed"><code>[ExmFeed]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmList

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#exm"><code>[Exm]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmThank

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipients<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updatedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmThankResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#exmthank"><code>[ExmThank]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ExmWelcomeContent

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## FacebookComment

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
commentCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
commentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
erxesApiId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isResolved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
permalink_url<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
postId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
senderId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timestamp<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## FacebookPost

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
erxesApiId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
permalink_url<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
postId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
senderId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timestamp<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Field

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
associatedField<br />
<a href="/api/objects#field"><code>Field</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
associatedFieldId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
canHide<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
column<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
field<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDefinedByErxes<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isRequired<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleInDetail<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleToCreate<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastUpdatedUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastUpdatedUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
locationOptions<br />
<a href="/api/objects#locationoption"><code>[LocationOption]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicAction<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logics<br />
<a href="/api/objects#logic"><code>[Logic]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
objectListConfigs<br />
<a href="/api/objects#objectlistconfig"><code>[ObjectListConfig]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
options<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pageNumber<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCategoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
products<br />
<a href="/api/objects#product"><code>[Product]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchable<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
showInCard<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
validation<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## FieldsGroup

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fields<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDefinedByErxes<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleInDetail<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastUpdatedUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastUpdatedUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Form

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buttonText<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fields<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
googleMapApiKey<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberOfPages<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## FormConnectResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
form<br />
<a href="/api/objects#form"><code>Form</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integration<br />
<a href="/api/objects#integration"><code>Integration</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## FormSubmission

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formFieldId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formFieldText<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
submittedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## GrowthHack

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
confidence<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ease<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formFields<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formSubmissions<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStages<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
impact<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVoted<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/objects#pipelinelabel"><code>[PipelineLabel]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipeline<br />
<a href="/api/objects#pipeline"><code>Pipeline</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reach<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scoringType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/objects#stage"><code>Stage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timeTrack<br />
<a href="/api/objects#timetrack"><code>TimeTrack</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voteCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
votedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ImportHistory

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypes<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
date<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
error<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
errorMsgs<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
failed<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
percentage<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
removed<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
success<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
total<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
updated<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ImportHistoryList

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
count<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
list<br />
<a href="/api/objects#importhistory"><code>[ImportHistory]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## InboxField

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversation<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
device<br />
<a href="/api/objects#field"><code>[Field]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Integration

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bookingData<br />
<a href="/api/objects#bookingdata"><code>BookingData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/objects#brand"><code>Brand</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channels<br />
<a href="/api/objects#channel"><code>[Channel]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
<a href="/api/objects#form"><code>Form</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
healthStatus<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isActive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
knowledgeBaseMessengerApps<br />
<a href="/api/objects#messengerapp"><code>[MessengerApp]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadMessengerApps<br />
<a href="/api/objects#messengerapp"><code>[MessengerApp]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uiOptions<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
webhookData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
websiteMessengerApps<br />
<a href="/api/objects#messengerapp"><code>[MessengerApp]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsGetUsedTypes

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsTotalCount

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
byBrand<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
byChannel<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
byKind<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
byStatus<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
byTag<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
total<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## InternalNote

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUserId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## InternalNotesByAction

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#modifiednote"><code>[ModifiedNote]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## KnowledgebaseApp

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
topicId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## KnowledgeBaseArticle

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reactionChoices<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reactionCounts<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
summary<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
topicId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
viewCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## KnowledgeBaseCategory

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
articles<br />
<a href="/api/objects#knowledgebasearticle"><code>[KnowledgeBaseArticle]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
authors<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstTopic<br />
<a href="/api/objects#knowledgebasetopic"><code>KnowledgeBaseTopic</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numOfArticles<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCategoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## KnowledgeBaseLoader

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
loadType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## KnowledgeBaseParentCategory

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
articles<br />
<a href="/api/objects#knowledgebasearticle"><code>[KnowledgeBaseArticle]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
authors<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
childrens<br />
<a href="/api/objects#knowledgebasecategory"><code>[KnowledgeBaseCategory]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstTopic<br />
<a href="/api/objects#knowledgebasetopic"><code>KnowledgeBaseTopic</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numOfArticles<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCategoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## KnowledgeBaseTopic

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
backgroundImage<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/objects#brand"><code>Brand</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categories<br />
<a href="/api/objects#knowledgebasecategory"><code>[KnowledgeBaseCategory]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
color<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCategories<br />
<a href="/api/objects#knowledgebaseparentcategory"><code>[KnowledgeBaseParentCategory]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## LeadApp

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
formCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## List

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#scorelog"><code>[ScoreLog]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
total<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## LocationOption

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lat<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lng<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Log

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
addedData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
changedData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extraDesc<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
newData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
objectId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
oldData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
removedData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unchangedData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unicode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Logic

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
fieldId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicOperator<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicValue<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## LogList

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
logs<br />
<a href="/api/objects#log"><code>[Log]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Lottery

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaign<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## LotteryCampaign

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteriesCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## LotteryMain

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#lottery"><code>[Lottery]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Loyalty

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
donates<br />
<a href="/api/objects#donate"><code>[Donate]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteries<br />
<a href="/api/objects#lottery"><code>[Lottery]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spins<br />
<a href="/api/objects#spin"><code>[Spin]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vouchers<br />
<a href="/api/objects#voucher"><code>[Voucher]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## LoyaltyConfig

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## MailAttachment

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content_type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filename<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mimeType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## MailData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
accountId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#mailattachment"><code>[MailAttachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bcc<br />
<a href="/api/objects#email"><code>[Email]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cc<br />
<a href="/api/objects#email"><code>[Email]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/api/objects#email"><code>[Email]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
inReplyTo<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationEmail<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
references<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
replyTo<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
replyToMessageId<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subject<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
threadId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/api/objects#email"><code>[Email]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## MessengerApp

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
accountId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
credentials<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
showInInbox<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## MessengerAppsResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
knowledgebases<br />
<a href="/api/objects#knowledgebaseapp"><code>[KnowledgebaseApp]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leads<br />
<a href="/api/objects#leadapp"><code>[LeadApp]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
websites<br />
<a href="/api/objects#websiteapp"><code>[WebSiteApp]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## MessengerConnectResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brand<br />
<a href="/api/objects#brand"><code>Brand</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uiOptions<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## MessengerSupportersResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
isOnline<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
serverTime<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supporters<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ModifiedNote

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeDetail<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Neighbor

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
info<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCategoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
rate<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Notification

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
date<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isRead<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
link<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
notifType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
receiver<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## NotificationConfiguration

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAllowed<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
notifType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ObjectListConfig

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
key<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## OnboardingGetAvailableFeaturesResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
settings<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
showSettings<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## OnboardingHistory

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
completedSteps<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCompleted<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## OnboardingNotification

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## OTPConfig

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
codeLength<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailTransporterType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
smsTransporterType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Permission

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
allowed<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
group<br />
<a href="/api/objects#usersgroup"><code>UsersGroup</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
module<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requiredActions<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PermissionAction

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
module<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PermissionModule

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Pipeline

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bgColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeCheckUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackScoringType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCheckDepartment<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCheckUser<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemsTotalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
members<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
metric<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberConfig<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberSize<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
state<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
templateId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PipelineChangeResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PipelineLabel

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
colorCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PipelineTemplate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDefinedByErxes<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stages<br />
<a href="/api/objects#pipelinetemplatestage"><code>[PipelineTemplateStage]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PipelineTemplateStage

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Pos

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
adminIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
allowBranchIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
beginNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cardsConfig<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cashierIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
catProdMappings<br />
<a href="/api/objects#catprod"><code>[CatProd]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deliveryConfig<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ebarimtConfig<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
erkhetConfig<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialCategoryIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isOnline<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kioskExcludeProductIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kioskMachine<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kitchenScreen<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
maxSkipNumber<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
onServer<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productDetails<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
token<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uiOptions<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
waitingScreen<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PosOrder

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
billId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
billType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cardAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cashAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finalAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mobileAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
oldBillId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
posName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
posToken<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
printedEbarimt<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
registerNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shouldPrintEbarimt<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
syncedErkhet<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PosOrderDetail

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
billId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
billType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cardAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cashAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finalAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mobileAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
oldBillId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
posName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
posToken<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
printedEbarimt<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
putResponses<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
registerNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shouldPrintEbarimt<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
syncedErkhet<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalAmount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PosProduct

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
amount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
category<br />
<a href="/api/objects#productcategory"><code>ProductCategory</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
counts<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sku<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitPrice<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PosProducts

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
products<br />
<a href="/api/objects#posproduct"><code>[PosProduct]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PosSlot

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
posId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Product

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachmentMore<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
category<br />
<a href="/api/objects#productcategory"><code>ProductCategory</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getTags<br />
<a href="/api/objects#tag"><code>[Tag]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
minimiumCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sku<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subUoms<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supply<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitPrice<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uom<br />
<a href="/api/objects#uom"><code>Uom</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uomId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vendor<br />
<a href="/api/objects#company"><code>Company</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vendorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ProductCategory

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isRoot<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ProductGroups

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludedCategoryIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludedProductIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
posId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ProductsConfig

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## PutResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
amount<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
billId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
billType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cashAmount<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cityTax<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerNo<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
date<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
errorCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getInformation<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
internalCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lottery<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryWarningMsg<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
macAddress<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
message<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
nonCashAmount<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
qrData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
registerNo<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
returnBillId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sendInfo<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stocks<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
success<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vat<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ResponseTemplate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/objects#brand"><code>Brand</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
files<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## RobotEntry

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
action<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Rule

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
condition<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SaveFormResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
errors<br />
<a href="/api/objects#error"><code>[Error]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
invoiceResponse<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
invoiceType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SchemaField

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
label<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ScoreLog

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
changeScore<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Script

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kbTopic<br />
<a href="/api/objects#knowledgebasetopic"><code>KnowledgeBaseTopic</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kbTopicId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leads<br />
<a href="/api/objects#integration"><code>[Integration]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messenger<br />
<a href="/api/objects#integration"><code>Integration</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SeenInfo

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
lastSeenMessageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
seenDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
user<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Segment

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
color<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditionsConjunction<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getSubSegments<br />
<a href="/api/objects#segment"><code>[Segment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shouldWriteActivityLog<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subOf<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subSegmentConditions<br />
<a href="/api/objects#segment"><code>[Segment]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Skill

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
typeId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SkillType

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SmsDelivery

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
direction<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
engageMessageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
errorMessages<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
erxesApiId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
responseData<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
statusUpdates<br />
<a href="/api/objects#smsstatus"><code>[SmsStatus]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
telnyxId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SmsStatus

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
date<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Spin

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaign<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SpinCampaign

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinsCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SpinMain

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#spin"><code>[Spin]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Stage

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
age<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
amount<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
compareNextStage<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
inProcessDealsTotalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialDealsTotalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemsTotalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
members<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
probability<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stayedDealsTotalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Structure

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coordinate<br />
<a href="/api/objects#coordinate"><code>Coordinate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisor<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Styles

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
activeTabColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
backgroundColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
baseColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
baseFont<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bodyColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dividerColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
footerColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headerColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headingColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headingFont<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
helpColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
linkColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
linkHoverColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryBtnColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
secondaryBtnColor<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Submission

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customer<br />
<a href="/api/objects#customer"><code>Customer</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
submissions<br />
<a href="/api/objects#formsubmission"><code>[FormSubmission]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## SuccessResult

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
success<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Tag

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
colorCode<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
objectCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relatedIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalObjectCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Task

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/objects#company"><code>[Company]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/objects#customer"><code>[Customer]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/objects#pipelinelabel"><code>[PipelineLabel]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipeline<br />
<a href="/api/objects#pipeline"><code>Pipeline</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/objects#stage"><code>Stage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timeTrack<br />
<a href="/api/objects#timetrack"><code>TimeTrack</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TaskListItem

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relations<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Ticket

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/api/objects#attachment"><code>[Attachment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/objects#company"><code>[Company]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdUser<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/objects#customer"><code>[Customer]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/objects#pipelinelabel"><code>[PipelineLabel]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipeline<br />
<a href="/api/objects#pipeline"><code>Pipeline</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/objects#stage"><code>Stage</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timeTrack<br />
<a href="/api/objects#timetrack"><code>TimeTrack</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TicketListItem

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUsers<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companies<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customers<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasNotified<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isWatched<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labels<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relations<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stage<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TimeTrack

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
startDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timeSpent<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## TotalForType

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
currencies<br />
<a href="/api/objects#dealtotalcurrency"><code>[DealTotalCurrency]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Trigger

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
actionId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
label<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
style<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Unit

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/api/objects#department"><code>Department</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisor<br />
<a href="/api/objects#user"><code>User</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
users<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Uom

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## User

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brands<br />
<a href="/api/objects#brand"><code>[Brand]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
configs<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
configsConstants<br />
<a href="/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/api/objects#department"><code>Department</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
details<br />
<a href="/api/objects#userdetailstype"><code>UserDetailsType</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailSignatures<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
getNotificationByEmail<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isActive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isOwner<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isShowNotification<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leaderBoardPosition<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
onboardingHistory<br />
<a href="/api/objects#onboardinghistory"><code>OnboardingHistory</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
permissionActions<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## UserConversationListResponse

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#conversation"><code>[Conversation]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## UserDetailsType

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avatar<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
birthDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fullName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
location<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
operatorPhone<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
position<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shortName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
workStartedDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## UsersGroup

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
members<br />
<a href="/api/objects#user"><code>[User]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VideoCallData

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recordingLinks<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## Voucher

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusInfo<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaign<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
owner<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VoucherCampaign

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/api/objects#attachment"><code>Attachment</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusProductId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coupon<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
discountPercent<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAt<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedBy<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCategoryIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scoreAction<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinCount<br />
<a href="/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vouchersCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## VoucherMain

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/objects#voucher"><code>[Voucher]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
totalCount<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WebbuilderContentType

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
displayName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
entries<br />
<a href="/api/objects#webbuilderentry"><code>[WebbuilderEntry]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fields<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
site<br />
<a href="/api/objects#webbuildersite"><code>WebbuilderSite</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
siteId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WebbuilderEntry

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
values<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WebbuilderPage

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
css<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
html<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
jsonData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
site<br />
<a href="/api/objects#webbuildersite"><code>WebbuilderSite</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
siteId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WebbuilderSite

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
domain<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WebbuilderTemplate

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
html<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
jsonData<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## WebSiteApp

<p style={{ marginBottom: "0.4em" }}><strong>Fields</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
buttonText<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>
