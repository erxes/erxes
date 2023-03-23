---
id: queries
title: Queries
slug: queries
sidebar_position: 1
---

## absenceDetail

**Type:** [Absence](/docs/api/objects#absence)



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

## absenceTypes

**Type:** [[AbsenceType]](/docs/api/objects#absencetype)



## activeMe

**Type:** [UserStatus](/docs/api/objects#userstatus)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## activityLogs

**Type:** [[ActivityLog]](/docs/api/objects#activitylog)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
activityType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## activityLogsByAction

**Type:** [ActivityLogByActionResponse](/docs/api/objects#activitylogbyactionresponse)



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
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## allBrands

**Type:** [[Brand]](/docs/api/objects#brand)



## allLeadIntegrations

**Type:** [[Integration]](/docs/api/objects#integration)



## allUsers

**Type:** [[User]](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assignedToMe<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
isActive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## appDetail

**Type:** [App](/docs/api/objects#app)



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

## apps

**Type:** [[App]](/docs/api/objects#app)



## appsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## archivedDeals

**Type:** [[Deal]](/docs/api/objects#deal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
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
search<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedDealsCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
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
search<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedGrowthHacks

**Type:** [[GrowthHack]](/docs/api/objects#growthhack)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
priorities<br />
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
search<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedGrowthHacksCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
labelIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
priorities<br />
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
search<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedStages

**Type:** [[Stage]](/docs/api/objects#stage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedStagesCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTasks

**Type:** [[Task]](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTasksCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTickets

**Type:** [[Ticket]](/docs/api/objects#ticket)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sources<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTicketsCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
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
endDate<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sources<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetCategories

**Type:** [[AssetCategory]](/docs/api/objects#assetcategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
searchValue<br />
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
withKbOnly<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetCategoriesTotalCount

**Type:** [Int](/docs/api/scalars#int)



## assetCategoryDetail

**Type:** [AssetCategory](/docs/api/objects#assetcategory)



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

## assetDetail

**Type:** [Asset](/docs/api/objects#asset)



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

## assetMovement

**Type:** [Movement](/docs/api/objects#movement)



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

## assetMovementItem

**Type:** [MovementItem](/docs/api/objects#movementitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assetMovementItems

**Type:** [[MovementItem]](/docs/api/objects#movementitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
<tr>
<td>
branchId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
createdAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAtTo<br />
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
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movementId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
teamMemberId<br />
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

## assetMovementItemsTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
<tr>
<td>
branchId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
createdAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAtTo<br />
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
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movementId<br />
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
teamMemberId<br />
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

## assetMovements

**Type:** [[Movement]](/docs/api/objects#movement)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
<tr>
<td>
branchId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
createdAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAtTo<br />
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
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movementId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
teamMemberId<br />
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

## assetMovementTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
assetId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
<tr>
<td>
branchId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
createdAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdAtTo<br />
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
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
modifiedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtFrom<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movedAtTo<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
movementId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
teamMemberId<br />
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

## assets

**Type:** [[Asset]](/docs/api/objects#asset)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## assetsTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## assignmentCampaignDetail

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
</tbody>
</table>

## assignmentCampaigns

**Type:** [[AssignmentCampaign]](/docs/api/objects#assignmentcampaign)



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
filterStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## assignmentCampaignsCount

**Type:** [Int](/docs/api/scalars#int)



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
filterStatus<br />
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
</tbody>
</table>

## assignmentDetail

**Type:** [Assignment](/docs/api/objects#assignment)



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

## assignments

**Type:** [[Assignment]](/docs/api/objects#assignment)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## assignmentsMain

**Type:** [AssignmentMain](/docs/api/objects#assignmentmain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## automationConfigPrievewCount

**Type:** [Int](/docs/api/scalars#int)



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
</tbody>
</table>

## automationConstants

**Type:** [JSON](/docs/api/scalars#json)



## automationDetail

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
</tbody>
</table>

## automationHistories

**Type:** [[AutomationHistory]](/docs/api/objects#automationhistory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
automationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
beginDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
status<br />
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
<tr>
<td>
triggerType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationNotes

**Type:** [[AutomationNote]](/docs/api/objects#automationnote)



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
<a href="/docs/api/scalars#string"><code>String!</code></a>
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

## automations

**Type:** [[Automation]](/docs/api/objects#automation)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## automationsMain

**Type:** [AutomationsListResponse](/docs/api/objects#automationslistresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## automationsTotalCount

**Type:** [automationsTotalCountResponse](/docs/api/objects#automationstotalcountresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## boardContentTypeDetail

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
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
</tbody>
</table>

## boardCounts

**Type:** [[BoardCount]](/docs/api/objects#boardcount)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## boardDetail

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
</tbody>
</table>

## boardGetLast

**Type:** [Board](/docs/api/objects#board)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## boardLogs

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
content<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
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
</tbody>
</table>

## boards

**Type:** [[Board]](/docs/api/objects#board)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## branchDetail

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
</tbody>
</table>

## branches

**Type:** [[Branch]](/docs/api/objects#branch)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
withoutUserFilter<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## branchesMain

**Type:** [BranchListQueryResponse](/docs/api/objects#branchlistqueryresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
withoutUserFilter<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## brandDetail

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
</tbody>
</table>

## brands

**Type:** [[Brand]](/docs/api/objects#brand)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## brandsGetLast

**Type:** [Brand](/docs/api/objects#brand)



## brandsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## cardsFields

**Type:** [JSON](/docs/api/scalars#json)



## channelDetail

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
</tbody>
</table>

## channels

**Type:** [[Channel]](/docs/api/objects#channel)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## channelsByMembers

**Type:** [[Channel]](/docs/api/objects#channel)



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
</tbody>
</table>

## channelsGetLast

**Type:** [Channel](/docs/api/objects#channel)



## channelsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## chatDetail

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
</tbody>
</table>

## chatMessageDetail

**Type:** [ChatMessage](/docs/api/objects#chatmessage)



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

## chatMessages

**Type:** [ChatMessageResponse](/docs/api/objects#chatmessageresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
chatId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chats

**Type:** [ChatResponse](/docs/api/objects#chatresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/enums#chattype"><code>ChatType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checkAssignment

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
customerId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checkDiscount

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
products<br />
<a href="/docs/api/inputObjects#productfield"><code>[ProductField]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checkedReportsPerUser

**Type:** [[CheckReport]](/docs/api/objects#checkreport)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## checkFreeTimes

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
intervals<br />
<a href="/docs/api/inputObjects#interval"><code>[Interval]</code></a>
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
</tbody>
</table>

## checkInvoice

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

## checklistDetail

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

## checklists

**Type:** [[Checklist]](/docs/api/objects#checklist)



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
</tbody>
</table>

## checkLoyalties

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
products<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalComments

**Type:** [[ClientPortalComment]](/docs/api/objects#clientportalcomment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
</tbody>
</table>

## clientPortalConfigsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## clientPortalCurrentUser

**Type:** [ClientPortalUser](/docs/api/objects#clientportaluser)



## clientPortalGetConfig

**Type:** [ClientPortal](/docs/api/objects#clientportal)



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

## clientPortalGetConfigByDomain

**Type:** [ClientPortal](/docs/api/objects#clientportal)



## clientPortalGetConfigs

**Type:** [[ClientPortal]](/docs/api/objects#clientportal)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalGetLast

**Type:** [ClientPortal](/docs/api/objects#clientportal)



## clientPortalGetTasks

**Type:** [[Task]](/docs/api/objects#task)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## clientPortalGetTaskStages

**Type:** [[Stage]](/docs/api/objects#stage)



## clientPortalKnowledgeBaseArticles

**Type:** [[KnowledgeBaseArticle]](/docs/api/objects#knowledgebasearticle)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categoryIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
topicId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalKnowledgeBaseTopicDetail

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
</tbody>
</table>

## clientPortalNotificationCount

**Type:** [Int](/docs/api/scalars#int)



## clientPortalNotificationDetail

**Type:** [ClientPortalNotification](/docs/api/objects#clientportalnotification)



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

## clientPortalNotifications

**Type:** [[ClientPortalNotification]](/docs/api/objects#clientportalnotification)



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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
notifType<br />
<a href="/docs/api/enums#notificationtype"><code>NotificationType</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireRead<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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

## clientPortalTicket

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

## clientPortalTickets

**Type:** [[Ticket]](/docs/api/objects#ticket)



## clientPortalUserCounts

**Type:** [Int](/docs/api/scalars#int)



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
</tbody>
</table>

## clientPortalUserDetail

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
</tbody>
</table>

## clientPortalUsers

**Type:** [[ClientPortalUser]](/docs/api/objects#clientportaluser)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cpId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## clientPortalUsersMain

**Type:** [clientPortalUsersListResponse](/docs/api/objects#clientportaluserslistresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cpId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## commentCount

**Type:** [Int](/docs/api/scalars#int)



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
</tbody>
</table>

## comments

**Type:** [CommentResponse](/docs/api/objects#commentresponse)



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
limit<br />
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
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companies

**Type:** [[Company]](/docs/api/objects#company)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## companiesMain

**Type:** [CompaniesListResponse](/docs/api/objects#companieslistresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## companyCounts

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
only<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
segment<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## companyDetail

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
</tbody>
</table>

## configs

**Type:** [[Config]](/docs/api/objects#config)



## configsCheckActivateInstallation

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
</tbody>
</table>

## configsCheckPremiumService

**Type:** [Boolean](/docs/api/scalars#boolean)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## configsConstants

**Type:** [JSON](/docs/api/scalars#json)



## configsGetEmailTemplate

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## configsGetEnv

**Type:** [ENV](/docs/api/objects#env)



## configsGetInstallationStatus

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
</tbody>
</table>

## configsGetValue

**Type:** [JSON](/docs/api/scalars#json)



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

## configsGetVersion

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
releaseNotes<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## contactsLogs

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
content<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentId<br />
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
</tbody>
</table>

## conversationCounts

**Type:** [JSON](/docs/api/scalars#json)



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
ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
only<br />
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

## conversationDetail

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
</tbody>
</table>

## conversationMessage

**Type:** [ConversationMessage](/docs/api/objects#conversationmessage)



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

## conversationMessages

**Type:** [[ConversationMessage]](/docs/api/objects#conversationmessage)



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
getFirst<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationMessagesTotalCount

**Type:** [Int](/docs/api/scalars#int)



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
</tbody>
</table>

## conversations

**Type:** [[Conversation]](/docs/api/objects#conversation)



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
ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## conversationsGetLast

**Type:** [Conversation](/docs/api/objects#conversation)



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
ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## conversationsTotalCount

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
ids<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## conversationsTotalUnreadCount

**Type:** [Int](/docs/api/scalars#int)



## convertToInfo

**Type:** [ConvertTo](/docs/api/objects#convertto)



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
</tbody>
</table>

## cpDonateCampaigns

**Type:** [[DonateCampaign]](/docs/api/objects#donatecampaign)



## cpLotteryCampaigns

**Type:** [[LotteryCampaign]](/docs/api/objects#lotterycampaign)



## cpSpinCampaigns

**Type:** [[SpinCampaign]](/docs/api/objects#spincampaign)



## cpVoucherCampaigns

**Type:** [[VoucherCampaign]](/docs/api/objects#vouchercampaign)



## currentAssetMovementItems

**Type:** [[MovementItem]](/docs/api/objects#movementitem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## currentUser

**Type:** [User](/docs/api/objects#user)



## customerCounts

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
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
brand<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
excludeIds<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
integration<br />
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
only<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
segment<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentData<br />
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
startDate<br />
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
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## customerDetail

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
</tbody>
</table>

## customers

**Type:** [[Customer]](/docs/api/objects#customer)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
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
brand<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
excludeIds<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
integration<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
segmentData<br />
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
tag<br />
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

## customersMain

**Type:** [CustomersListResponse](/docs/api/objects#customerslistresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
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
brand<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dateFilters<br />
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
excludeIds<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
integration<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
segmentData<br />
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
tag<br />
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

## dashboardCountByTags

**Type:** [JSON](/docs/api/scalars#json)



## dashboardDetails

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
</tbody>
</table>

## dashboardGetTypes

**Type:** [[String]](/docs/api/scalars#string)



## dashboardItemDetail

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
</tbody>
</table>

## dashboardItems

**Type:** [[DashboardItem]](/docs/api/objects#dashboarditem)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dashboardId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboards

**Type:** [[Dashboard]](/docs/api/objects#dashboard)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## dashboardsMain

**Type:** [DashboardListResponse](/docs/api/objects#dashboardlistresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## dashboardsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## dealDetail

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

## deals

**Type:** [[DealListItem]](/docs/api/objects#deallistitem)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
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
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedEndDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedStartDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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

## dealsTotalAmounts

**Type:** [[TotalForType]](/docs/api/objects#totalfortype)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
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
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedEndDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedStartDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
tagIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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

## dealsTotalCount

**Type:** [Int](/docs/api/scalars#int)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
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
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedEndDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedStartDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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

## departmentDetail

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
</tbody>
</table>

## departments

**Type:** [[Department]](/docs/api/objects#department)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
withoutUserFilter<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## departmentsMain

**Type:** [DepartmentListQueryResponse](/docs/api/objects#departmentlistqueryresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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
withoutUserFilter<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## deviceConfigs

**Type:** [DeviceConfigsListResponse](/docs/api/objects#deviceconfigslistresponse)



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
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reportType<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## documents

**Type:** [[Document]](/docs/api/objects#document)



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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## documentsDetail

**Type:** [Document](/docs/api/objects#document)



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

## documentsGetEditorAttributes

**Type:** [[DocumentEditorAttribute]](/docs/api/objects#documenteditorattribute)



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
</tbody>
</table>

## documentsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## donateCampaignDetail

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
</tbody>
</table>

## donateCampaigns

**Type:** [[DonateCampaign]](/docs/api/objects#donatecampaign)



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
filterStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateCampaignsCount

**Type:** [Int](/docs/api/scalars#int)



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
filterStatus<br />
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
</tbody>
</table>

## donateDetail

**Type:** [Donate](/docs/api/objects#donate)



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

## donates

**Type:** [[Donate]](/docs/api/objects#donate)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## donatesMain

**Type:** [DonateMain](/docs/api/objects#donatemain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## emailDeliveriesAsLogs

**Type:** [[JSON]](/docs/api/scalars#json)



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
</tbody>
</table>

## emailDeliveryDetail

**Type:** [EmailDelivery](/docs/api/objects#emaildelivery)



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

## emailTemplates

**Type:** [[EmailTemplate]](/docs/api/objects#emailtemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailTemplatesTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emojiCount

**Type:** [Int](/docs/api/scalars#int)



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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emojiIsReacted

**Type:** [Boolean](/docs/api/scalars#boolean)



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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emojiReactedUsers

**Type:** [[User]](/docs/api/objects#user)



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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## enabledServices

**Type:** [JSON](/docs/api/scalars#json)



## engageEmailPercentages

**Type:** [AvgEmailStats](/docs/api/objects#avgemailstats)



## engageLogs

**Type:** [[EngageLog]](/docs/api/objects#engagelog)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
engageMessageId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageCounts

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
kind<br />
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
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageDetail

**Type:** [EngageMessage](/docs/api/objects#engagemessage)



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

## engageMessages

**Type:** [[EngageMessage]](/docs/api/objects#engagemessage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## engageMessagesTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## engageReportsList

**Type:** [EngageDeliveryReport](/docs/api/objects#engagedeliveryreport)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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

## engagesConfigDetail

**Type:** [JSON](/docs/api/scalars#json)



## engageSmsDeliveries

**Type:** [DeliveryList](/docs/api/objects#deliverylist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
to<br />
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

## engageVerifiedEmails

**Type:** [[String]](/docs/api/scalars#string)



## exmFeed

**Type:** [ExmFeedResponse](/docs/api/objects#exmfeedresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
bravoType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypes<br />
<a href="/docs/api/enums#contenttype"><code>[ContentType]</code></a>
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
isPinned<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientType<br />
<a href="/docs/api/enums#recipienttype"><code>RecipientType</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/enums#sourcetype"><code>SourceType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedCeremonies

**Type:** [ExmFeedResponse](/docs/api/objects#exmfeedresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/docs/api/enums#contenttype"><code>ContentType</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterType<br />
<a href="/docs/api/enums#filtertype"><code>FilterType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedDetail

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
</tbody>
</table>

## exmGet

**Type:** [Exm](/docs/api/objects#exm)



## exms

**Type:** [ExmList](/docs/api/objects#exmlist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## exmThanks

**Type:** [ExmThankResponse](/docs/api/objects#exmthankresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/docs/api/enums#sourcetype"><code>SourceType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exportHistories

**Type:** [ExportHistoryList](/docs/api/objects#exporthistorylist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## exportHistoryDetail

**Type:** [ImportHistory](/docs/api/objects#importhistory)



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

## exportHistoryGetColumns

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exportHistoryGetDuplicatedHeaders

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentNames<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookConversationDetail

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

## facebookConversationMessages

**Type:** [[FacebookConversationMessage]](/docs/api/objects#facebookconversationmessage)



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
getFirst<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookConversationMessagesCount

**Type:** [Int](/docs/api/scalars#int)



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
</tbody>
</table>

## facebookGetAccounts

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## facebookGetCommentCount

**Type:** [JSON](/docs/api/scalars#json)



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
isResolved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookGetComments

**Type:** [[FacebookComment]](/docs/api/objects#facebookcomment)



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
conversationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isResolved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
senderId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookGetConfigs

**Type:** [JSON](/docs/api/scalars#json)



## facebookGetIntegrationDetail

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
erxesApiId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookGetIntegrations

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## facebookGetPages

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
accountId<br />
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

## facebookGetPost

**Type:** [FacebookPost](/docs/api/objects#facebookpost)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
erxesApiId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## facebookHasTaggedMessages

**Type:** [Boolean](/docs/api/scalars#boolean)



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
</tbody>
</table>

## fields

**Type:** [[Field]](/docs/api/objects#field)



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
isVisibleToCreate<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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
searchable<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsCombinedByContentType

**Type:** [JSON](/docs/api/scalars#json)



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
contentType<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludedNames<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
onlyDates<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usageType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsDefaultColumnsConfig

**Type:** [[ColumnConfigItem]](/docs/api/objects#columnconfigitem)



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
</tbody>
</table>

## fieldsGetDetail

**Type:** [Field](/docs/api/objects#field)



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
code<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGetTypes

**Type:** [[JSON]](/docs/api/scalars#json)



## fieldsGroups

**Type:** [[FieldsGroup]](/docs/api/objects#fieldsgroup)



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
contentType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isDefinedByErxes<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formDetail

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
</tbody>
</table>

## forms

**Type:** [[Form]](/docs/api/objects#form)



## formSubmissionDetail

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
</tbody>
</table>

## formSubmissions

**Type:** [[Submission]](/docs/api/objects#submission)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeIds<br />
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
filters<br />
<a href="/docs/api/inputObjects#submissionfilter"><code>[SubmissionFilter]</code></a>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
tagId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formSubmissionsTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeIds<br />
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
filters<br />
<a href="/docs/api/inputObjects#submissionfilter"><code>[SubmissionFilter]</code></a>
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
tagId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## getChatIdByUserIds

**Type:** [String](/docs/api/scalars#string)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## getDbSchemaLabels

**Type:** [[SchemaField]](/docs/api/objects#schemafield)



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
</tbody>
</table>

## getFieldsInputTypes

**Type:** [[JSON]](/docs/api/scalars#json)



## getPaymentConfig

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
</tbody>
</table>

## getPaymentConfigs

**Type:** [[PaymentConfig]](/docs/api/objects#paymentconfig)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## getSystemFieldsGroup

**Type:** [FieldsGroup](/docs/api/objects#fieldsgroup)



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
</tbody>
</table>

## getUnreadChatCount

**Type:** [Int](/docs/api/scalars#int)



## growthHackDetail

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

## growthHacks

**Type:** [[GrowthHack]](/docs/api/objects#growthhack)



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
assignedToMe<br />
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
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStage<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
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
limit<br />
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
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksPriorityMatrix

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksTotalCount

**Type:** [Int](/docs/api/scalars#int)



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
assignedToMe<br />
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
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStage<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
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
limit<br />
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
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## historyGetTypes

**Type:** [JSON](/docs/api/scalars#json)



## historyPreviewCount

**Type:** [String](/docs/api/scalars#string)



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
segmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## holidays

**Type:** [[Absence]](/docs/api/objects#absence)



## imapConversationDetail

**Type:** [[IMap]](/docs/api/objects#imap)



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
</tbody>
</table>

## imapGetIntegrations

**Type:** [[IMapIntegration]](/docs/api/objects#imapintegration)



## imapLogs

**Type:** [[JSON]](/docs/api/scalars#json)



## importHistories

**Type:** [ImportHistoryList](/docs/api/objects#importhistorylist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## importHistoryDetail

**Type:** [ImportHistory](/docs/api/objects#importhistory)



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

## importHistoryGetColumns

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentName<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistoryGetDuplicatedHeaders

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentNames<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## inboxFields

**Type:** [InboxField](/docs/api/objects#inboxfield)



## integrationDetail

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

## integrationGetLineWebhookUrl

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

## integrations

**Type:** [[Integration]](/docs/api/objects#integration)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
formLoadType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## integrationsGetAccounts

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## integrationsGetConfigs

**Type:** [JSON](/docs/api/scalars#json)



## integrationsGetIntegrationDetail

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
erxesApiId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsGetIntegrations

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## integrationsGetUsedTypes

**Type:** [[integrationsGetUsedTypes]](/docs/api/objects#integrationsgetusedtypes)



## integrationsTotalCount

**Type:** [integrationsTotalCount](/docs/api/objects#integrationstotalcount)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
formLoadType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## internalNoteDetail

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

## internalNotes

**Type:** [[InternalNote]](/docs/api/objects#internalnote)



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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## internalNotesAsLogs

**Type:** [[JSON]](/docs/api/scalars#json)



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
</tbody>
</table>

## internalNotesByAction

**Type:** [InternalNotesByAction](/docs/api/objects#internalnotesbyaction)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## invoices

**Type:** [[Invoice]](/docs/api/objects#invoice)



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
kind<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## invoicesTotalCount

**Type:** [invoicesTotalCount](/docs/api/objects#invoicestotalcount)



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
kind<br />
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
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## isChatUserOnline

**Type:** [[UserStatus]](/docs/api/objects#userstatus)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## itemsCountByAssignedUser

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
stackBy<br />
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

## itemsCountBySegments

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
pipelineId<br />
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

## knowledgeBaseArticleDetail

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
</tbody>
</table>

## knowledgeBaseArticleDetailAndIncViewCount

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
</tbody>
</table>

## knowledgeBaseArticles

**Type:** [[KnowledgeBaseArticle]](/docs/api/objects#knowledgebasearticle)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categoryIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## knowledgeBaseArticlesTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categoryIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategories

**Type:** [[KnowledgeBaseCategory]](/docs/api/objects#knowledgebasecategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
topicIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoriesGetLast

**Type:** [KnowledgeBaseCategory](/docs/api/objects#knowledgebasecategory)



## knowledgeBaseCategoriesTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
topicIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoryDetail

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
</tbody>
</table>

## knowledgeBaseTopicDetail

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
</tbody>
</table>

## knowledgeBaseTopics

**Type:** [[KnowledgeBaseTopic]](/docs/api/objects#knowledgebasetopic)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## knowledgeBaseTopicsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## logs

**Type:** [LogList](/docs/api/objects#loglist)



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
end<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
start<br />
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
userId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteries

**Type:** [[Lottery]](/docs/api/objects#lottery)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteriesCampaignCustomerList

**Type:** [LotteryMain](/docs/api/objects#lotterymain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteriesMain

**Type:** [LotteryMain](/docs/api/objects#lotterymain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignDetail

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
</tbody>
</table>

## lotteryCampaigns

**Type:** [[LotteryCampaign]](/docs/api/objects#lotterycampaign)



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
filterStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignsCount

**Type:** [Int](/docs/api/scalars#int)



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
filterStatus<br />
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
</tbody>
</table>

## lotteryCampaignWinnerList

**Type:** [LotteryMain](/docs/api/objects#lotterymain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryDetail

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
</tbody>
</table>

## loyalties

**Type:** [Loyalty](/docs/api/objects#loyalty)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
statuses<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## loyaltyConfigs

**Type:** [[LoyaltyConfig]](/docs/api/objects#loyaltyconfig)



## messengerApps

**Type:** [MessengerAppsResponse](/docs/api/objects#messengerappsresponse)



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
</tbody>
</table>

## noDepartmentUsers

**Type:** [[User]](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
excludeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationCounts

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypes<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
notifType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireRead<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notifications

**Type:** [[Notification]](/docs/api/objects#notification)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypes<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
notifType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireRead<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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
title<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationsGetConfigurations

**Type:** [[NotificationConfiguration]](/docs/api/objects#notificationconfiguration)



## notificationsModules

**Type:** [[JSON]](/docs/api/scalars#json)



## onboardingGetAvailableFeatures

**Type:** [[OnboardingGetAvailableFeaturesResponse]](/docs/api/objects#onboardinggetavailablefeaturesresponse)



## onboardingStepsCompleteness

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
steps<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## payDates

**Type:** [[PayDate]](/docs/api/objects#paydate)



## paymentConfigsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## payments

**Type:** [[Payment]](/docs/api/objects#payment)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## paymentsCountByType

**Type:** [paymentsTotalCount](/docs/api/objects#paymentstotalcount)



## paymentsTotalCount

**Type:** [paymentsTotalCount](/docs/api/objects#paymentstotalcount)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
kind<br />
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

## permissionActions

**Type:** [[PermissionAction]](/docs/api/objects#permissionaction)



## permissionModules

**Type:** [[PermissionModule]](/docs/api/objects#permissionmodule)



## permissions

**Type:** [[Permission]](/docs/api/objects#permission)



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
allowed<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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
module<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## permissionsTotalCount

**Type:** [Int](/docs/api/scalars#int)



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
allowed<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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
module<br />
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

## pipelineAssignedUsers

**Type:** [[User]](/docs/api/objects#user)



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

## pipelineDetail

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
</tbody>
</table>

## pipelineLabelDetail

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
</tbody>
</table>

## pipelineLabels

**Type:** [[PipelineLabel]](/docs/api/objects#pipelinelabel)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## pipelines

**Type:** [[Pipeline]](/docs/api/objects#pipeline)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
isAll<br />
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## pipelineStateCount

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineTemplateDetail

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

## pipelineTemplates

**Type:** [[PipelineTemplate]](/docs/api/objects#pipelinetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## pipelineTemplatesTotalCount

**Type:** [Int](/docs/api/scalars#int)



## productCategories

**Type:** [[ProductCategory]](/docs/api/objects#productcategory)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
parentId<br />
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
status<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productCategoriesTotalCount

**Type:** [Int](/docs/api/scalars#int)



## productCategoryDetail

**Type:** [ProductCategory](/docs/api/objects#productcategory)



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

## productCountByTags

**Type:** [JSON](/docs/api/scalars#json)



## productDetail

**Type:** [Product](/docs/api/objects#product)



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

## products

**Type:** [[Product]](/docs/api/objects#product)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
segment<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentData<br />
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
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsConfigs

**Type:** [[ProductsConfig]](/docs/api/objects#productsconfig)



## productsGroupCounts

**Type:** [JSON](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
only<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productsTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
segment<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentData<br />
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
type<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## requestsMain

**Type:** [RequestsListResponse](/docs/api/objects#requestslistresponse)



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
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reportType<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplates

**Type:** [[ResponseTemplate]](/docs/api/objects#responsetemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplatesTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## robotEntries

**Type:** [[RobotEntry]](/docs/api/objects#robotentry)



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
isNotified<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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

## scheduleConfigs

**Type:** [[ScheduleConfig]](/docs/api/objects#scheduleconfig)



## scheduleDetail

**Type:** [Schedule](/docs/api/objects#schedule)



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

## schedulesMain

**Type:** [SchedulesListResponse](/docs/api/objects#scheduleslistresponse)



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
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reportType<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## schedulesPerUser

**Type:** [[Schedule]](/docs/api/objects#schedule)



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

## scoreLogList

**Type:** [List](/docs/api/objects#list)



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
fromDate<br />
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
orderType<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
toDate<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scoreLogs

**Type:** [[ScoreLog]](/docs/api/objects#scorelog)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## scripts

**Type:** [[Script]](/docs/api/objects#script)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scriptsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## search

**Type:** [[JSON]](/docs/api/scalars#json)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## segmentDetail

**Type:** [Segment](/docs/api/objects#segment)



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

## segments

**Type:** [[Segment]](/docs/api/objects#segment)



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
contentTypes<br />
<a href="/docs/api/scalars#string"><code>[String]!</code></a>
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
</tbody>
</table>

## segmentsEvents

**Type:** [[JSON]](/docs/api/scalars#json)



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
</tbody>
</table>

## segmentsGetAssociationTypes

**Type:** [[JSON]](/docs/api/scalars#json)



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
</tbody>
</table>

## segmentsGetHeads

**Type:** [[Segment]](/docs/api/objects#segment)



## segmentsGetTypes

**Type:** [[JSON]](/docs/api/scalars#json)



## segmentsPreviewCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conditions<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
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
subOf<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## skill

**Type:** [Skill](/docs/api/objects#skill)



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

## skills

**Type:** [[Skill]](/docs/api/objects#skill)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
typeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## skillsTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## skillTypes

**Type:** [[SkillType]](/docs/api/objects#skilltype)



## skillTypesTotalCount

**Type:** [Int](/docs/api/scalars#int)



## spinCampaignDetail

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
</tbody>
</table>

## spinCampaigns

**Type:** [[SpinCampaign]](/docs/api/objects#spincampaign)



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
filterStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinCampaignsCount

**Type:** [Int](/docs/api/scalars#int)



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
filterStatus<br />
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
</tbody>
</table>

## spinDetail

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

## spins

**Type:** [[Spin]](/docs/api/objects#spin)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinsMain

**Type:** [SpinMain](/docs/api/objects#spinmain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stageDetail

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
age<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
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
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extraParams<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
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
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stages

**Type:** [[Stage]](/docs/api/objects#stage)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
age<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
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
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
customerIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
extraParams<br />
<a href="/docs/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAll<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isNotLost<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## structureDetail

**Type:** [Structure](/docs/api/objects#structure)



## tagDetail

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
</tbody>
</table>

## tags

**Type:** [[Tag]](/docs/api/objects#tag)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
searchValue<br />
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

## tagsGetTypes

**Type:** [[JSON]](/docs/api/scalars#json)



## taskDetail

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

## tasks

**Type:** [[TaskListItem]](/docs/api/objects#tasklistitem)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## tasksAsLogs

**Type:** [[JSON]](/docs/api/scalars#json)



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
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksTotalCount

**Type:** [Int](/docs/api/scalars#int)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## ticketDetail

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

## tickets

**Type:** [[TicketListItem]](/docs/api/objects#ticketlistitem)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
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

## ticketsTotalCount

**Type:** [Int](/docs/api/scalars#int)



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
assignedToMe<br />
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
branchIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
closeDateType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
conformityIsRelated<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
date<br />
<a href="/docs/api/inputObjects#itemdate"><code>ItemDate</code></a>
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
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
number<br />
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
pipelineId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
pipelineIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priority<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
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
segmentData<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
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

## timeclockActivePerUser

**Type:** [Timeclock](/docs/api/objects#timeclock)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## timeclockDetail

**Type:** [Timeclock](/docs/api/objects#timeclock)



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

## timeclockReportByUser

**Type:** [UserReport](/docs/api/objects#userreport)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
selectedUser<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeclockReports

**Type:** [ReportsListResponse](/docs/api/objects#reportslistresponse)



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
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reportType<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeclocksMain

**Type:** [TimeClocksListResponse](/docs/api/objects#timeclockslistresponse)



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
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reportType<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timelogsMain

**Type:** [TimelogListResponse](/docs/api/objects#timeloglistresponse)



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
endDate<br />
<a href="/docs/api/scalars#date"><code>Date</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
reportType<br />
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
userIds<br />
<a href="/docs/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## timeLogsPerUser

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

## transactionEmailDeliveries

**Type:** [EmailDeliveryList](/docs/api/objects#emaildeliverylist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## unitDetail

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
</tbody>
</table>

## units

**Type:** [[Unit]](/docs/api/objects#unit)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## unitsMain

**Type:** [UnitListQueryResponse](/docs/api/objects#unitlistqueryresponse)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
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

## uoms

**Type:** [[Uom]](/docs/api/objects#uom)



## uomsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## userConversations

**Type:** [UserConversationListResponse](/docs/api/objects#userconversationlistresponse)



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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## userDetail

**Type:** [User](/docs/api/objects#user)



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

## userMovements

**Type:** [[UserMovement]](/docs/api/objects#usermovement)



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
userId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## users

**Type:** [[User]](/docs/api/objects#user)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
branchId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
departmentId<br />
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
isActive<br />
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireUsername<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
unitId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroups

**Type:** [[UsersGroup]](/docs/api/objects#usersgroup)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroupsTotalCount

**Type:** [Int](/docs/api/scalars#int)



## usersTotalCount

**Type:** [Int](/docs/api/scalars#int)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
branchId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
departmentId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
isActive<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireUsername<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
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
unitId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## voucherCampaignDetail

**Type:** [VoucherCampaign](/docs/api/objects#vouchercampaign)



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

## voucherCampaigns

**Type:** [[VoucherCampaign]](/docs/api/objects#vouchercampaign)



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
equalTypeCampaignId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## voucherCampaignsCount

**Type:** [Int](/docs/api/scalars#int)



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
filterStatus<br />
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
</tbody>
</table>

## voucherDetail

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
</tbody>
</table>

## vouchers

**Type:** [[Voucher]](/docs/api/objects#voucher)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## vouchersMain

**Type:** [VoucherMain](/docs/api/objects#vouchermain)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
searchValue<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## webbuilderContentTypeDetail

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
</tbody>
</table>

## webbuilderContentTypes

**Type:** [[WebbuilderContentType]](/docs/api/objects#webbuildercontenttype)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## webbuilderContentTypesMain

**Type:** [WebbuilderContentTypesList](/docs/api/objects#webbuildercontenttypeslist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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

## webbuilderEntriesMain

**Type:** [WebbuilderEntriesList](/docs/api/objects#webbuilderentrieslist)



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
page<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## webbuilderEntryDetail

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
</tbody>
</table>

## webbuilderPageDetail

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
</tbody>
</table>

## webbuilderPagesMain

**Type:** [WebbuilderPagesList](/docs/api/objects#webbuilderpageslist)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
siteId<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderSites

**Type:** [[WebbuilderSite]](/docs/api/objects#webbuildersite)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
fromSelect<br />
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## webbuilderSitesTotalCount

**Type:** [Int](/docs/api/scalars#int)



## webbuilderTemplateDetail

**Type:** [WebbuilderTemplate](/docs/api/objects#webbuildertemplate)



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

## webbuilderTemplates

**Type:** [[WebbuilderTemplate]](/docs/api/objects#webbuildertemplate)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
perPage<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
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
</tbody>
</table>

## webbuilderTemplatesTotalCount

**Type:** [Int](/docs/api/scalars#int)



## widgetsBookingProductWithFields

**Type:** [BookingProduct](/docs/api/objects#bookingproduct)



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

## widgetsConversationDetail

**Type:** [ConversationDetailResponse](/docs/api/objects#conversationdetailresponse)



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
integrationId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsConversations

**Type:** [[Conversation]](/docs/api/objects#conversation)



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
integrationId<br />
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

## widgetsGetEngageMessage

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
integrationId<br />
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

## widgetsGetMessengerIntegration

**Type:** [Integration](/docs/api/objects#integration)



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
</tbody>
</table>

## widgetsKnowledgeBaseArticles

**Type:** [[KnowledgeBaseArticle]](/docs/api/objects#knowledgebasearticle)



<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchString<br />
<a href="/docs/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
topicId<br />
<a href="/docs/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsKnowledgeBaseTopicDetail

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
</tbody>
</table>

## widgetsMessages

**Type:** [[ConversationMessage]](/docs/api/objects#conversationmessage)



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

## widgetsMessengerSupporters

**Type:** [MessengerSupportersResponse](/docs/api/objects#messengersupportersresponse)



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
</tbody>
</table>

## widgetsProductCategory

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
</tbody>
</table>

## widgetsTotalUnreadCount

**Type:** [Int](/docs/api/scalars#int)



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
integrationId<br />
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

## widgetsUnreadCount

**Type:** [Int](/docs/api/scalars#int)



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

## zaloAccounts

**Type:** [JSON](/docs/api/scalars#json)



## zaloConversationDetail

**Type:** [[Zalo]](/docs/api/objects#zalo)



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
</tbody>
</table>

## zaloConversationMessages

**Type:** [[ZaloConversationMessage]](/docs/api/objects#zaloconversationmessage)



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
getFirst<br />
<a href="/docs/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/docs/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## zaloConversationMessagesCount

**Type:** [Int](/docs/api/scalars#int)



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
</tbody>
</table>

## zaloGetAccounts

**Type:** [JSON](/docs/api/scalars#json)



## zaloGetConfigs

**Type:** [JSON](/docs/api/scalars#json)



