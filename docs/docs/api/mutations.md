---
id: mutations
title: Mutations
slug: mutations
sidebar_position: 2
---

## absenceTypeAdd

**Type:** [AbsenceType](/docs/api/objects#absencetype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
explRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestHoursPerDay<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestTimeType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shiftRequest<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## absenceTypeEdit

**Type:** [AbsenceType](/docs/api/objects#absencetype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
explRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestHoursPerDay<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestTimeType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requestType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shiftRequest<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## absenceTypeRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## addUserSkills

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
memberId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skillIds<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## appsAdd

**Type:** [App](/docs/api/objects#app)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
expireDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userGroupId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## appsEdit

**Type:** [App](/docs/api/objects#app)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
expireDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userGroupId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## appsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetCategoryAdd

**Type:** [AssetCategory](/docs/api/objects#assetcategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetCategoryEdit

**Type:** [AssetCategory](/docs/api/objects#assetcategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetCategoryRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetMovementAdd

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
items<br />
<a href="/docs/api/inputObjects#imovementitem"><code>[IMovementItem]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAt<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetMovementRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetMovementUpdate

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetsAdd

**Type:** [Asset](/docs/api/objects#asset)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetCount<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachmentMore<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitPrice<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vendorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetsAssignKbArticles

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
action<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
articleIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ignoreIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
irregular<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
withKnowledgebase<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetsEdit

**Type:** [Asset](/docs/api/objects#asset)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assetCount<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachmentMore<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitPrice<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vendorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetsMerge

**Type:** [Asset](/docs/api/objects#asset)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetFields<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assetIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetsRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetIds<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assignmentCampaignsAdd

**Type:** [AssignmentCampaign](/docs/api/objects#assignmentcampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assignmentCampaignsEdit

**Type:** [AssignmentCampaign](/docs/api/objects#assignmentcampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assignmentCampaignsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assignmentsAdd

**Type:** [Assignment](/docs/api/objects#assignment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assignmentsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsAdd

**Type:** [Automation](/docs/api/objects#automation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
actions<br />
<a href="/docs/api/inputObjects#actioninput"><code>[ActionInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggers<br />
<a href="/docs/api/inputObjects#triggerinput"><code>[TriggerInput]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsAddNote

**Type:** [AutomationNote](/docs/api/objects#automationnote)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
actionId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
automationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsCreateFromTemplate

**Type:** [Automation](/docs/api/objects#automation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsEdit

**Type:** [Automation](/docs/api/objects#automation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
actions<br />
<a href="/docs/api/inputObjects#actioninput"><code>[ActionInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggers<br />
<a href="/docs/api/inputObjects#triggerinput"><code>[TriggerInput]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsEditNote

**Type:** [AutomationNote](/docs/api/objects#automationnote)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
actionId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
automationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
triggerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsRemove

**Type:** [[String]](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
automationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsRemoveNote

**Type:** [AutomationNote](/docs/api/objects#automationnote)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationsSaveAsTemplate

**Type:** [Automation](/docs/api/objects#automation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
duplicate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## boardItemsSaveForGanttTimeline

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
items<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## boardItemUpdateTimeTracking

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
timeSpent<br />
<a href="/docs/api/scalars#int"><code>Int!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## boardsAdd

**Type:** [Board](/docs/api/objects#board)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## boardsEdit

**Type:** [Board](/docs/api/objects#board)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## boardsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## branchesAdd

**Type:** [Branch](/docs/api/objects#branch)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
address<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coordinate<br />
<a href="/docs/api/inputObjects#coordinateinput"><code>CoordinateInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
radius<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## branchesEdit

**Type:** [Branch](/docs/api/objects#branch)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
address<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coordinate<br />
<a href="/docs/api/inputObjects#coordinateinput"><code>CoordinateInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
radius<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## branchesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## brandsAdd

**Type:** [Brand](/docs/api/objects#brand)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailConfig<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## brandsEdit

**Type:** [Brand](/docs/api/objects#brand)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailConfig<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## brandsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## buyLottery

**Type:** [Lottery](/docs/api/objects#lottery)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## buySpin

**Type:** [Spin](/docs/api/objects#spin)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## buyVoucher

**Type:** [Voucher](/docs/api/objects#voucher)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
count<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## changeConversationOperator

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
operatorStatus<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## changeScore

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
changeScore<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdBy<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## channelsAdd

**Type:** [Channel](/docs/api/objects#channel)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## channelsEdit

**Type:** [Channel](/docs/api/objects#channel)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## channelsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatAdd

**Type:** [Chat](/docs/api/objects#chat)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participantIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/enums#chattype"><code>ChatType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/enums#chatvisibilitytype"><code>ChatVisibilityType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatAddOrRemoveMember

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/enums#chatmembermodifytype"><code>ChatMemberModifyType</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatEdit

**Type:** [Chat](/docs/api/objects#chat)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/enums#chatvisibilitytype"><code>ChatVisibilityType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatMakeOrRemoveAdmin

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatMarkAsRead

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatMessageAdd

**Type:** [ChatMessage](/docs/api/objects#chatmessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
chatId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mentionedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relatedId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatMessageRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatMessageToggleIsPinned

**Type:** [Boolean](/docs/api/scalars#boolean)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chatTypingInfo

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
chatId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistItemsAdd

**Type:** [ChecklistItem](/docs/api/objects#checklistitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
checklistId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isChecked<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistItemsEdit

**Type:** [ChecklistItem](/docs/api/objects#checklistitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
checklistId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isChecked<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistItemsOrder

**Type:** [ChecklistItem](/docs/api/objects#checklistitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationIndex<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistItemsRemove

**Type:** [ChecklistItem](/docs/api/objects#checklistitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistsAdd

**Type:** [Checklist](/docs/api/objects#checklist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistsEdit

**Type:** [Checklist](/docs/api/objects#checklist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistsRemove

**Type:** [Checklist](/docs/api/objects#checklist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checkReport

**Type:** [CheckReport](/docs/api/objects#checkreport)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checkSchedule

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
scheduleId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalCommentsAdd

**Type:** [ClientPortalComment](/docs/api/objects#clientportalcomment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
typeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalCommentsRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalConfigUpdate

**Type:** [ClientPortal](/docs/api/objects#clientportal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealBoardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealLabel<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealPipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealToggle<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
domain<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
footerHtml<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
googleCredentials<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headerHtml<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
icon<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kbToggle<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
knowledgeBaseLabel<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
knowledgeBaseTopicId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mailConfig<br />
<a href="/docs/api/inputObjects#mailconfiginput"><code>MailConfigInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
manualVerificationConfig<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerBrandCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mobileResponsive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
otpConfig<br />
<a href="/docs/api/inputObjects#otpconfiginput"><code>OTPConfigInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
publicTaskToggle<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
styles<br />
<a href="/docs/api/inputObjects#stylesparams"><code>StylesParams</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskBoardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskLabel<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskPipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskPublicBoardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskPublicPipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taskToggle<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketBoardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketLabel<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketPipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ticketToggle<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
url<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalConfirmInvitation

**Type:** [ClientPortalUser](/docs/api/objects#clientportaluser)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
passwordConfirmation<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
token<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalCreateCard

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subject<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalForgotPassword

**Type:** [String!](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalLogin

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deviceToken<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
login<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalLoginWithPhone

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deviceToken<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalLogout

**Type:** [String](/docs/api/scalars#string)



## clientPortalNotificationsMarkAsRead

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalNotificationsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalRegister

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyRegistrationNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalResetPassword

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
newPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
token<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalResetPasswordWithCode

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalSendNotification

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isMobile<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
receivers<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUpdateUser

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#clientportaluserupdate"><code>ClientPortalUserUpdate!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUserChangePassword

**Type:** [ClientPortalUser](/docs/api/objects#clientportaluser)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
currentPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
newPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersChangeVerificationStatus

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
status<br />
<a href="/docs/api/enums#clientportaluserverificationstatus"><code>ClientPortalUserVerificationStatus!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersEdit

**Type:** [ClientPortalUser](/docs/api/objects#clientportaluser)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyRegistrationNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersInvite

**Type:** [ClientPortalUser](/docs/api/objects#clientportaluser)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyRegistrationNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
clientPortalUserIds<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersReplacePhone

**Type:** [String!](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersSendVerificationRequest

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
clientPortalId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
login<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersVerify

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUsersVerifyPhone

**Type:** [String!](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUserUpdateNotificationSettings

**Type:** [ClientPortalUser](/docs/api/objects#clientportaluser)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configs<br />
<a href="/docs/api/inputObjects#notificationconfiginput"><code>[NotificationConfigInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
receiveByEmail<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
receiveBySms<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalVerifyOTP

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
emailOtp<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneOtp<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## commentAdd

**Type:** [Comment](/docs/api/objects#comment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
comment<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## commentEdit

**Type:** [Comment](/docs/api/objects#comment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
comment<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## commentRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companiesAdd

**Type:** [Company](/docs/api/objects#company)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
businessType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emails<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
industry<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
location<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
names<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCompanyId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phones<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryEmail<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryPhone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
website<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companiesEdit

**Type:** [Company](/docs/api/objects#company)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
businessType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emails<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
industry<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
location<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
names<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentCompanyId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phones<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryEmail<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryPhone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
size<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
website<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companiesEditByField

**Type:** [Company](/docs/api/objects#company)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
selector<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companiesMerge

**Type:** [Company](/docs/api/objects#company)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
companyFields<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companiesRemove

**Type:** [[String]](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
companyIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## configsActivateInstallation

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
hostname<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
token<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## configsManagePluginInstall

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## configsUpdate

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## confirmLoyalties

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
checkInfo<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conformityAdd

**Type:** [Conformity](/docs/api/objects#conformity)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
mainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conformityEdit

**Type:** [SuccessResult](/docs/api/objects#successresult)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
mainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
relTypeIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationConvertToCard

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bookingProductId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationCreateVideoChatRoom

**Type:** [VideoCallData](/docs/api/objects#videocalldata)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationEditCustomFields

**Type:** [Conversation](/docs/api/objects#conversation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationMarkAsRead

**Type:** [Conversation](/docs/api/objects#conversation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationMessageAdd

**Type:** [ConversationMessage](/docs/api/objects#conversationmessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extraInfo<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
internal<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mentionedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationResolveAll

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awaitingResponse<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participating<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
starred<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unassigned<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationsAssign

**Type:** [[Conversation]](/docs/api/objects#conversation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assignedUserId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationsChangeStatus

**Type:** [[Conversation]](/docs/api/objects#conversation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationsUnassign

**Type:** [[Conversation]](/docs/api/objects#conversation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## cpAssignmentsAdd

**Type:** [Assignment](/docs/api/objects#assignment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## cpAssignmentsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## cpDonatesAdd

**Type:** [Donate](/docs/api/objects#donate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
donateScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## cpDonatesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createSkill

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
typeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createSkillType

**Type:** [SkillType](/docs/api/objects#skilltype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## createTimeClockFromLog

**Type:** [Timeclock](/docs/api/objects#timeclock)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
timelog<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersAdd

**Type:** [Customer](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
birthDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailValidationStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emails<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasAuthority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
middleName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneValidationStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phones<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
position<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryEmail<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryPhone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sex<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
state<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersChangeState

**Type:** [Customer](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersChangeStateBulk

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersChangeVerificationStatus

**Type:** [[Customer]](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersEdit

**Type:** [Customer](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
avatar<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
birthDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emailValidationStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
emails<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasAuthority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isSubscribed<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
middleName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneValidationStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phones<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
position<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryEmail<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
primaryPhone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sex<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersEditByField

**Type:** [Customer](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
selector<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersMerge

**Type:** [Customer](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
customerFields<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersRemove

**Type:** [[String]](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customersVerify

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
verificationType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardItemsAdd

**Type:** [DashboardItem](/docs/api/objects#dashboarditem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dashboardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDateRange<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
layout<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vizState<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardItemsEdit

**Type:** [DashboardItem](/docs/api/objects#dashboarditem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dashboardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
layout<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vizState<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardItemsRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardsAdd

**Type:** [Dashboard](/docs/api/objects#dashboard)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
selectedMemberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardsEdit

**Type:** [Dashboard](/docs/api/objects#dashboard)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
selectedMemberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dashboardIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsAdd

**Type:** [Deal](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paymentsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceConversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsArchive

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsChange

**Type:** [Deal](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationStageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsCopy

**Type:** [Deal](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsEdit

**Type:** [Deal](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paymentsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceConversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsRemove

**Type:** [Deal](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsWatch

**Type:** [Deal](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAdd<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## departmentsAdd

**Type:** [Department](/docs/api/objects#department)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## departmentsEdit

**Type:** [Department](/docs/api/objects#department)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## departmentsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## deviceConfigAdd

**Type:** [DeviceConfig](/docs/api/objects#deviceconfig)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deviceName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extractRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
serialNo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## deviceConfigEdit

**Type:** [DeviceConfig](/docs/api/objects#deviceconfig)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deviceName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extractRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
serialNo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## deviceConfigRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## documentsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## documentsSave

**Type:** [Document](/docs/api/objects#document)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
replacer<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## doLottery

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## doLotteryMultiple

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
multiple<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateCampaignsAdd

**Type:** [DonateCampaign](/docs/api/objects#donatecampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
maxScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateCampaignsEdit

**Type:** [DonateCampaign](/docs/api/objects#donatecampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
maxScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateCampaignsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donatesAdd

**Type:** [Donate](/docs/api/objects#donate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
donateScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donatesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## doSpin

**Type:** [Spin](/docs/api/objects#spin)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailTemplatesAdd

**Type:** [EmailTemplate](/docs/api/objects#emailtemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailTemplatesChangeStatus

**Type:** [EmailTemplate](/docs/api/objects#emailtemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailTemplatesDuplicate

**Type:** [EmailTemplate](/docs/api/objects#emailtemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailTemplatesEdit

**Type:** [EmailTemplate](/docs/api/objects#emailtemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailTemplatesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emojiReact

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageAdd

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerTagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/inputObjects#engagemessageemail"><code>EngageMessageEmail</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
forceCreateConversation<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUserId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDraft<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messenger<br />
<a href="/docs/api/inputObjects#engagemessagemessenger"><code>EngageMessageMessenger</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
method<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleDate<br />
<a href="/docs/api/inputObjects#engagescheduledateinput"><code>EngageScheduleDateInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shortMessage<br />
<a href="/docs/api/inputObjects#engagemessagesmsinput"><code>EngageMessageSmsInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stopDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageCopy

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageEdit

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerTagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/inputObjects#engagemessageemail"><code>EngageMessageEmail</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
forceCreateConversation<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromUserId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDraft<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messenger<br />
<a href="/docs/api/inputObjects#engagemessagemessenger"><code>EngageMessageMessenger</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
method<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleDate<br />
<a href="/docs/api/inputObjects#engagescheduledateinput"><code>EngageScheduleDateInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shortMessage<br />
<a href="/docs/api/inputObjects#engagemessagesmsinput"><code>EngageMessageSmsInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stopDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageRemove

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageRemoveVerifiedEmail

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageSendTestEmail

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageSetLive

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageSetLiveManual

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageSetPause

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageVerifyEmail

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageSendMail

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bcc<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cc<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subject<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engagesUpdateConfigs

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## excludeUserSkill

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedAdd

**Type:** [ExmFeed](/docs/api/objects#exmfeed)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/enums#contenttype"><code>ContentType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eventData<br />
<a href="/docs/api/inputObjects#exmeventdatainput"><code>ExmEventDataInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
images<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isPinned<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedEdit

**Type:** [ExmFeed](/docs/api/objects#exmfeed)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/enums#contenttype"><code>ContentType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
department<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
eventData<br />
<a href="/docs/api/inputObjects#exmeventdatainput"><code>ExmEventDataInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
images<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isPinned<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedEventGoingOrInterested

**Type:** [ExmFeed](/docs/api/objects#exmfeed)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
goingOrInterested<br />
<a href="/docs/api/enums#exmgoingorinterested"><code>ExmGoingOrInterested!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedToggleIsPinned

**Type:** [Boolean](/docs/api/scalars#boolean)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmsAdd

**Type:** [Exm](/docs/api/objects#exm)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
appearance<br />
<a href="/docs/api/inputObjects#exmappearanceinput"><code>ExmAppearanceInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
features<br />
<a href="/docs/api/inputObjects#exmfeatureinput"><code>[ExmFeatureInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
welcomeContent<br />
<a href="/docs/api/inputObjects#exmwelcomecontentinput"><code>[ExmWelcomeContentInput]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmsEdit

**Type:** [Exm](/docs/api/objects#exm)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
appearance<br />
<a href="/docs/api/inputObjects#exmappearanceinput"><code>ExmAppearanceInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
features<br />
<a href="/docs/api/inputObjects#exmfeatureinput"><code>[ExmFeatureInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logo<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
welcomeContent<br />
<a href="/docs/api/inputObjects#exmwelcomecontentinput"><code>[ExmWelcomeContentInput]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmThankAdd

**Type:** [ExmThank](/docs/api/objects#exmthank)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientIds<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmThankEdit

**Type:** [ExmThank](/docs/api/objects#exmthank)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientIds<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmThankRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exportHistoriesCreate

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
columnsConfig<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## extractAllDataFromMsSQL

**Type:** [[Timeclock]](/docs/api/objects#timeclock)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## extractTimeLogsFromMsSQL

**Type:** [[Timelog]](/docs/api/objects#timelog)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookChangeCommentStatus

**Type:** [FacebookComment](/docs/api/objects#facebookcomment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
commentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookRepair

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookReplyToComment

**Type:** [FacebookComment](/docs/api/objects#facebookcomment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
commentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookUpdateConfigs

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsAdd

**Type:** [Field](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
associatedFieldId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
canHide<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleToCreate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
locationOptions<br />
<a href="/docs/api/inputObjects#locationoptioninput"><code>[LocationOptionInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicAction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logics<br />
<a href="/docs/api/inputObjects#logicinput"><code>[LogicInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
objectListConfigs<br />
<a href="/docs/api/inputObjects#objectlistconfiginput"><code>[objectListConfigInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
options<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchable<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
showInCard<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
validation<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsBulkAddAndEdit

**Type:** [[Field]](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
addingFields<br />
<a href="/docs/api/inputObjects#fielditem"><code>[FieldItem]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
editingFields<br />
<a href="/docs/api/inputObjects#fielditem"><code>[FieldItem]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsEdit

**Type:** [Field](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
associatedFieldId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
canHide<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleToCreate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
locationOptions<br />
<a href="/docs/api/inputObjects#locationoptioninput"><code>[LocationOptionInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicAction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logics<br />
<a href="/docs/api/inputObjects#logicinput"><code>[LogicInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
objectListConfigs<br />
<a href="/docs/api/inputObjects#objectlistconfiginput"><code>[objectListConfigInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
options<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchable<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
showInCard<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
validation<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGroupsAdd

**Type:** [FieldsGroup](/docs/api/objects#fieldsgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isMultiple<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleInDetail<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicAction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logics<br />
<a href="/docs/api/inputObjects#logicinput"><code>[LogicInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGroupsEdit

**Type:** [FieldsGroup](/docs/api/objects#fieldsgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isMultiple<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleInDetail<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logicAction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
logics<br />
<a href="/docs/api/inputObjects#logicinput"><code>[LogicInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGroupsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGroupsUpdateOrder

**Type:** [[FieldsGroup]](/docs/api/objects#fieldsgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
orders<br />
<a href="/docs/api/inputObjects#orderitem"><code>[OrderItem]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGroupsUpdateVisible

**Type:** [FieldsGroup](/docs/api/objects#fieldsgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleInDetail<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsRemove

**Type:** [Field](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsUpdateOrder

**Type:** [[Field]](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
orders<br />
<a href="/docs/api/inputObjects#orderitem"><code>[OrderItem]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsUpdateSystemFields

**Type:** [Field](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isRequired<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleToCreate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsUpdateVisible

**Type:** [Field](/docs/api/objects#field)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisible<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVisibleInDetail<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## forgotPassword

**Type:** [String!](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formsAdd

**Type:** [Form](/docs/api/objects#form)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
buttonText<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
googleMapApiKey<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberOfPages<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formsEdit

**Type:** [Form](/docs/api/objects#form)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buttonText<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
googleMapApiKey<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberOfPages<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formSubmissionsEdit

**Type:** [Submission](/docs/api/objects#submission)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
submissions<br />
<a href="/docs/api/inputObjects#formsubmissioninput"><code>[FormSubmissionInput]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formSubmissionsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formSubmissionsSave

**Type:** [Boolean](/docs/api/scalars#boolean)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formSubmissions<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## generateInvoiceUrl

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
amount<br />
<a href="/docs/api/scalars#float"><code>Float!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paymentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
redirectUri<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## getNextChar

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awardId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
prevChars<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksAdd

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
confidence<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ease<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStages<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
impact<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reach<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksArchive

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksChange

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationStageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksCopy

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksEdit

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
confidence<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ease<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStages<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
impact<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reach<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksRemove

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksVote

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isVote<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksWatch

**Type:** [GrowthHack](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAdd<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## holidayAdd

**Type:** [Absence](/docs/api/objects#absence)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## holidayEdit

**Type:** [Absence](/docs/api/objects#absence)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## holidayRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## imapSendMail

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bcc<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
body<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cc<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
from<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
headerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
inReplyTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
references<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
replyTo<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
replyToMessageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shouldResolve<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subject<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
threadId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistoriesCancel

**Type:** [Boolean](/docs/api/scalars#boolean)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistoriesCreate

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
associatedContentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
associatedField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
columnsConfig<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypes<br />
<a href="/docs/api/scalars#json"><code>[JSON]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
files<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
importName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistoriesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsArchive

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#boolean"><code>Boolean!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsCopyLeadIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsCreateBookingIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
bookingData<br />
<a href="/docs/api/inputObjects#integrationbookingdata"><code>IntegrationBookingData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadData<br />
<a href="/docs/api/inputObjects#integrationleaddata"><code>IntegrationLeadData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsCreateExternalIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
accountId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsCreateLeadIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadData<br />
<a href="/docs/api/inputObjects#integrationleaddata"><code>IntegrationLeadData!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsCreateMessengerIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsEditBookingIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bookingData<br />
<a href="/docs/api/inputObjects#integrationbookingdata"><code>IntegrationBookingData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadData<br />
<a href="/docs/api/inputObjects#integrationleaddata"><code>IntegrationLeadData</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsEditCommonFields

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsEditLeadIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadData<br />
<a href="/docs/api/inputObjects#integrationleaddata"><code>IntegrationLeadData!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsEditMessengerIntegration

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
languageCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsRemoveAccount

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsRepair

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsSaveMessengerAppearanceData

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uiOptions<br />
<a href="/docs/api/inputObjects#messengeruioptions"><code>MessengerUiOptions</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsSaveMessengerConfigs

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerData<br />
<a href="/docs/api/inputObjects#integrationmessengerdata"><code>IntegrationMessengerData</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsSendSms

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsUpdateConfigs

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## internalNotesAdd

**Type:** [InternalNote](/docs/api/objects#internalnote)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mentionedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## internalNotesEdit

**Type:** [InternalNote](/docs/api/objects#internalnote)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
mentionedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## internalNotesRemove

**Type:** [InternalNote](/docs/api/objects#internalnote)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseArticlesAdd

**Type:** [KnowledgeBaseArticle](/docs/api/objects#knowledgebasearticle)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#knowledgebasearticledoc"><code>KnowledgeBaseArticleDoc!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseArticlesEdit

**Type:** [KnowledgeBaseArticle](/docs/api/objects#knowledgebasearticle)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#knowledgebasearticledoc"><code>KnowledgeBaseArticleDoc!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseArticlesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoriesAdd

**Type:** [KnowledgeBaseCategory](/docs/api/objects#knowledgebasecategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#knowledgebasecategorydoc"><code>KnowledgeBaseCategoryDoc!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoriesEdit

**Type:** [KnowledgeBaseCategory](/docs/api/objects#knowledgebasecategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#knowledgebasecategorydoc"><code>KnowledgeBaseCategoryDoc!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoriesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseTopicsAdd

**Type:** [KnowledgeBaseTopic](/docs/api/objects#knowledgebasetopic)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#knowledgebasetopicdoc"><code>KnowledgeBaseTopicDoc!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseTopicsEdit

**Type:** [KnowledgeBaseTopic](/docs/api/objects#knowledgebasetopic)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
doc<br />
<a href="/docs/api/inputObjects#knowledgebasetopicdoc"><code>KnowledgeBaseTopicDoc!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseTopicsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## login

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
deviceToken<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## logout

**Type:** [String](/docs/api/scalars#string)



## lotteriesAdd

**Type:** [Lottery](/docs/api/objects#lottery)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteriesEdit

**Type:** [Lottery](/docs/api/objects#lottery)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteriesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignsAdd

**Type:** [LotteryCampaign](/docs/api/objects#lotterycampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignsEdit

**Type:** [LotteryCampaign](/docs/api/objects#lotterycampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## loyaltyConfigsUpdate

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## messengerAppSave

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerApps<br />
<a href="/docs/api/inputObjects#messengerappsinput"><code>MessengerAppsInput</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationsMarkAsRead

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationsSaveConfig

**Type:** [NotificationConfiguration](/docs/api/objects#notificationconfiguration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
isAllowed<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
notifType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationsShow

**Type:** [String](/docs/api/scalars#string)



## onboardingCheckStatus

**Type:** [String](/docs/api/scalars#string)



## onboardingCompleteShowStep

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
step<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## onboardingForceComplete

**Type:** [JSON](/docs/api/scalars#json)



## payDateAdd

**Type:** [PayDate](/docs/api/objects#paydate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dateNums<br />
<a href="/docs/api/scalars#int"><code>[Int]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## payDateEdit

**Type:** [PayDate](/docs/api/objects#paydate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateNums<br />
<a href="/docs/api/scalars#int"><code>[Int]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## payDateRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## paymentAdd

**Type:** [Payment](/docs/api/objects#payment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
config<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## paymentConfigsAdd

**Type:** [PaymentConfig](/docs/api/objects#paymentconfig)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paymentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## paymentConfigsEdit

**Type:** [PaymentConfig](/docs/api/objects#paymentconfig)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paymentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## paymentConfigsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## paymentEdit

**Type:** [Payment](/docs/api/objects#payment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kind<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## paymentRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## permissionsAdd

**Type:** [[Permission]](/docs/api/objects#permission)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
actions<br />
<a href="/docs/api/scalars#string"><code>[String!]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
allowed<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupIds<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
module<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## permissionsFix

**Type:** [[String]](/docs/api/scalars#string)



## permissionsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineLabelsAdd

**Type:** [PipelineLabel](/docs/api/objects#pipelinelabel)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
colorCode<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineLabelsEdit

**Type:** [PipelineLabel](/docs/api/objects#pipelinelabel)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
colorCode<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineLabelsLabel

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String!]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
targetId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineLabelsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesAdd

**Type:** [Pipeline](/docs/api/objects#pipeline)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
bgColor<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeCheckUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackScoringType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCheckDepartment<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCheckUser<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
metric<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberConfig<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberSize<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stages<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
templateId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesArchive

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesCopied

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesEdit

**Type:** [Pipeline](/docs/api/objects#pipeline)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bgColor<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
boardId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeCheckUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackScoringType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCheckDepartment<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isCheckUser<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
metric<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberConfig<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberSize<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stages<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
templateId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visibility<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesUpdateOrder

**Type:** [[Pipeline]](/docs/api/objects#pipeline)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
orders<br />
<a href="/docs/api/inputObjects#orderitem"><code>[OrderItem]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelinesWatch

**Type:** [Pipeline](/docs/api/objects#pipeline)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAdd<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineTemplatesAdd

**Type:** [PipelineTemplate](/docs/api/objects#pipelinetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stages<br />
<a href="/docs/api/inputObjects#pipelinetemplatestageinput"><code>[PipelineTemplateStageInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineTemplatesDuplicate

**Type:** [PipelineTemplate](/docs/api/objects#pipelinetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineTemplatesEdit

**Type:** [PipelineTemplate](/docs/api/objects#pipelinetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stages<br />
<a href="/docs/api/inputObjects#pipelinetemplatestageinput"><code>[PipelineTemplateStageInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineTemplatesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productCategoriesAdd

**Type:** [ProductCategory](/docs/api/objects#productcategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
meta<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productCategoriesEdit

**Type:** [ProductCategory](/docs/api/objects#productcategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
meta<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productCategoriesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsAdd

**Type:** [Product](/docs/api/objects#product)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachmentMore<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
barcodeDescription<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
barcodes<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
minimiumCount<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCount<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sku<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subUoms<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supply<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitPrice<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uomId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vendorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsConfigsUpdate

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsEdit

**Type:** [Product](/docs/api/objects#product)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachmentMore<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
barcodeDescription<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
barcodes<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
categoryId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
minimiumCount<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCount<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sku<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subUoms<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supply<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
taxType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitPrice<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
uomId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
vendorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsMerge

**Type:** [Product](/docs/api/objects#product)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
productFields<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
productIds<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## removeSkill

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## removeSkillType

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## renderDashboard

**Type:** [String](/docs/api/scalars#string)



## resetPassword

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
newPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
token<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplatesAdd

**Type:** [ResponseTemplate](/docs/api/objects#responsetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
files<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplatesEdit

**Type:** [ResponseTemplate](/docs/api/objects#responsetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
files<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplatesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## robotEntriesMarkAsNotified

**Type:** [[RobotEntry]](/docs/api/objects#robotentry)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scheduleConfigAdd

**Type:** [ScheduleConfig](/docs/api/objects#scheduleconfig)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configShiftEnd<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
configShiftStart<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleConfig<br />
<a href="/docs/api/inputObjects#shiftsrequestinput"><code>[ShiftsRequestInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scheduleConfigEdit

**Type:** [ScheduleConfig](/docs/api/objects#scheduleconfig)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
configShiftEnd<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
configShiftStart<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleConfig<br />
<a href="/docs/api/inputObjects#shiftsrequestinput"><code>[ShiftsRequestInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scheduleConfigRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scheduleRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scheduleShiftRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scriptsAdd

**Type:** [Script](/docs/api/objects#script)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
kbTopicId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scriptsEdit

**Type:** [Script](/docs/api/objects#script)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
kbTopicId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
leadIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
messengerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scriptsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentsAdd

**Type:** [Segment](/docs/api/objects#segment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
color<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditionSegments<br />
<a href="/docs/api/inputObjects#subsegment"><code>[SubSegment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#segmentcondition"><code>[SegmentCondition]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditionsConjunction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shouldWriteActivityLog<br />
<a href="/docs/api/scalars#boolean"><code>Boolean!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subOf<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentsEdit

**Type:** [Segment](/docs/api/objects#segment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
color<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditionSegments<br />
<a href="/docs/api/inputObjects#subsegment"><code>[SubSegment]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditions<br />
<a href="/docs/api/inputObjects#segmentcondition"><code>[SegmentCondition]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conditionsConjunction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
config<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shouldWriteActivityLog<br />
<a href="/docs/api/scalars#boolean"><code>Boolean!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subOf<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## sendAbsenceRequest

**Type:** [Absence](/docs/api/objects#absence)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
absenceTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endTime<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
explanation<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reason<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startTime<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## sendScheduleRequest

**Type:** [Schedule](/docs/api/objects#schedule)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
scheduleConfigId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shifts<br />
<a href="/docs/api/inputObjects#shiftsrequestinput"><code>[ShiftsRequestInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## shareScore

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
destinationCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationEmail<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationOwnerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationPhone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## solveAbsenceRequest

**Type:** [Absence](/docs/api/objects#absence)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## solveScheduleRequest

**Type:** [Schedule](/docs/api/objects#schedule)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## solveShiftRequest

**Type:** [ShiftsRequest](/docs/api/objects#shiftsrequest)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinCampaignsAdd

**Type:** [SpinCampaign](/docs/api/objects#spincampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinCampaignsEdit

**Type:** [SpinCampaign](/docs/api/objects#spincampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
awards<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinCampaignsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinsAdd

**Type:** [Spin](/docs/api/objects#spin)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinsEdit

**Type:** [Spin](/docs/api/objects#spin)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stagesEdit

**Type:** [Stage](/docs/api/objects#stage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stagesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stagesSortItems

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stagesUpdateOrder

**Type:** [[Stage]](/docs/api/objects#stage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
orders<br />
<a href="/docs/api/inputObjects#orderitem"><code>[OrderItem]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## structuresAdd

**Type:** [Structure](/docs/api/objects#structure)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coordinate<br />
<a href="/docs/api/inputObjects#coordinateinput"><code>CoordinateInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
website<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## structuresEdit

**Type:** [Structure](/docs/api/objects#structure)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coordinate<br />
<a href="/docs/api/inputObjects#coordinateinput"><code>CoordinateInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
image<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phoneNumber<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
website<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## structuresRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## submitCheckInOutRequest

**Type:** [AbsenceType](/docs/api/objects#absencetype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
checkTime<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
checkType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## submitSchedule

**Type:** [Schedule](/docs/api/objects#schedule)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scheduleConfigId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shifts<br />
<a href="/docs/api/inputObjects#shiftsrequestinput"><code>[ShiftsRequestInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tagsAdd

**Type:** [Tag](/docs/api/objects#tag)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
colorCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tagsEdit

**Type:** [Tag](/docs/api/objects#tag)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
colorCode<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tagsMerge

**Type:** [Tag](/docs/api/objects#tag)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
destId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tagsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tagsTag

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String!]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
targetIds<br />
<a href="/docs/api/scalars#string"><code>[String!]!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksAdd

**Type:** [Task](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceConversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksArchive

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksChange

**Type:** [Task](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationStageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksCopy

**Type:** [Task](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksEdit

**Type:** [Task](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceConversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksRemove

**Type:** [Task](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksWatch

**Type:** [Task](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAdd<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsAdd

**Type:** [Ticket](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceConversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsArchive

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsChange

**Type:** [Ticket](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
destinationStageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
itemId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceStageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsCopy

**Type:** [Ticket](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsEdit

**Type:** [Ticket](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
aboveItemId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedUserIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isComplete<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
order<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
parentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
proccessId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reminderMinute<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sourceConversationIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsRemove

**Type:** [Ticket](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## ticketsWatch

**Type:** [Ticket](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAdd<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeclockEdit

**Type:** [Timeclock](/docs/api/objects#timeclock)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shiftActive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shiftEnd<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
shiftStart<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeclockRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeclockStart

**Type:** [Timeclock](/docs/api/objects#timeclock)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deviceType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
latitude<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
longitude<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeclockStop

**Type:** [Timeclock](/docs/api/objects#timeclock)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deviceType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
latitude<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
longitude<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## unitsAdd

**Type:** [Unit](/docs/api/objects#unit)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## unitsEdit

**Type:** [Unit](/docs/api/objects#unit)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
supervisorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## unitsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## uomsAdd

**Type:** [Uom](/docs/api/objects#uom)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## uomsEdit

**Type:** [Uom](/docs/api/objects#uom)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## uomsRemove

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
uomIds<br />
<a href="/docs/api/scalars#string"><code>[String!]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateSkill

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
exclude<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
typeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## updateSkillType

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## userRegistrationCreate

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersChangePassword

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
currentPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
newPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersConfigEmailSignatures

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
signatures<br />
<a href="/docs/api/inputObjects#emailsignature"><code>[EmailSignature]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersConfigGetNotificationByEmail

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
isAllowed<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersConfirmInvitation

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
fullName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
passwordConfirmation<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
token<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersCreateOwner

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
firstName<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lastName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
purpose<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
subscribeEmail<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersEdit

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brandIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
channelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customFieldsData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
departmentIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
details<br />
<a href="/docs/api/inputObjects#userdetails"><code>UserDetails</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
employeeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
groupIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersEditProfile

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
details<br />
<a href="/docs/api/inputObjects#userdetails"><code>UserDetails</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
employeeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
links<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
password<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
username<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroupsAdd

**Type:** [UsersGroup](/docs/api/objects#usersgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroupsCopy

**Type:** [UsersGroup](/docs/api/objects#usersgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroupsEdit

**Type:** [UsersGroup](/docs/api/objects#usersgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
memberIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroupsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersInvite

**Type:** [Boolean](/docs/api/scalars#boolean)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
entries<br />
<a href="/docs/api/inputObjects#invitationentry"><code>[InvitationEntry]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersResendInvitation

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersResetMemberPassword

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
newPassword<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersSeenOnBoard

**Type:** [User](/docs/api/objects#user)



## usersSetActiveStatus

**Type:** [User](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## voucherCampaignsAdd

**Type:** [VoucherCampaign](/docs/api/objects#vouchercampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusCount<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusProductId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coupon<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
discountPercent<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryCount<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCategoryIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scoreAction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinCount<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## voucherCampaignsEdit

**Type:** [VoucherCampaign](/docs/api/objects#vouchercampaign)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
attachment<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusCount<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
bonusProductId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
buyScore<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coupon<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
discountPercent<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
finishDateOfUse<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
lotteryCount<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
numberFormat<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productCategoryIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
score<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
scoreAction<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
spinCount<br />
<a href="/docs/api/scalars#float"><code>Float</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
startDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
voucherType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## voucherCampaignsRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## vouchersAdd

**Type:** [Voucher](/docs/api/objects#voucher)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## vouchersEdit

**Type:** [Voucher](/docs/api/objects#voucher)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
campaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
ownerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usedAt<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## vouchersRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderContentTypesAdd

**Type:** [WebbuilderContentType](/docs/api/objects#webbuildercontenttype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
displayName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fields<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
siteId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderContentTypesEdit

**Type:** [WebbuilderContentType](/docs/api/objects#webbuildercontenttype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
displayName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fields<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
siteId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderContentTypesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderEntriesAdd

**Type:** [WebbuilderEntry](/docs/api/objects#webbuilderentry)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
values<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderEntriesEdit

**Type:** [WebbuilderEntry](/docs/api/objects#webbuilderentry)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypeId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
values<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderEntriesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderPagesAdd

**Type:** [WebbuilderPage](/docs/api/objects#webbuilderpage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
css<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
html<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
siteId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderPagesEdit

**Type:** [WebbuilderPage](/docs/api/objects#webbuilderpage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
css<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
description<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
html<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
siteId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderPagesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderSitesAdd

**Type:** [WebbuilderSite](/docs/api/objects#webbuildersite)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
domain<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderSitesDuplicate

**Type:** [WebbuilderSite](/docs/api/objects#webbuildersite)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderSitesEdit

**Type:** [WebbuilderSite](/docs/api/objects#webbuildersite)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
domain<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderSitesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderTemplatesAdd

**Type:** [WebbuilderTemplate](/docs/api/objects#webbuildertemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
html<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderTemplatesRemove

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderTemplatesUse

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
coverImage<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>AttachmentInput</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
name<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetBotRequest

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
message<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
payload<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetGetBotInitialMessage

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsBookingConnect

**Type:** [Integration](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsInsertMessage

**Type:** [ConversationMessage](/docs/api/objects#conversationmessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
message<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skillId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsLeadConnect

**Type:** [FormConnectResponse](/docs/api/objects#formconnectresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandCode<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cachedCustomerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formCode<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsLeadIncreaseViewCount

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsMessengerConnect

**Type:** [MessengerConnectResponse](/docs/api/objects#messengerconnectresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandCode<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cachedCustomerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyData<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
data<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
deviceToken<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
email<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isUser<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
phone<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsReadConversationMessages

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsSaveBooking

**Type:** [SaveFormResponse](/docs/api/objects#saveformresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
browserInfo<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cachedCustomerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
productId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
submissions<br />
<a href="/docs/api/inputObjects#fieldvalueinput"><code>[FieldValueInput]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsSaveBrowserInfo

**Type:** [ConversationMessage](/docs/api/objects#conversationmessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
browserInfo<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsSaveCustomerGetNotified

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
value<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
visitorId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsSaveLead

**Type:** [SaveFormResponse](/docs/api/objects#saveformresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
browserInfo<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cachedCustomerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
submissions<br />
<a href="/docs/api/inputObjects#fieldvalueinput"><code>[FieldValueInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsSendEmail

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachments<br />
<a href="/docs/api/inputObjects#attachmentinput"><code>[AttachmentInput]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
content<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
fromEmail<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
toEmails<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsSendTypingInfo

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
text<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## zaloRemoveAccount

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_id<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## zaloUpdateConfigs

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
configsMap<br />
<a href="/docs/api/scalars#json"><code>JSON!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

