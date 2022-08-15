---
id: queries
title: Queries
slug: queries
sidebar_position: 1
---

## activityLogs

**Type:** [[ActivityLog]](/api/objects#activitylog)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
activityType<br />
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## activityLogsByAction

**Type:** [ActivityLogByActionResponse](/api/objects#activitylogbyactionresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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

## allBrands

**Type:** [[Brand]](/api/objects#brand)

## allLeadIntegrations

**Type:** [[Integration]](/api/objects#integration)

## allUsers

**Type:** [[User]](/api/objects#user)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
isActive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## appDetail

**Type:** [App](/api/objects#app)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## apps

**Type:** [[App]](/api/objects#app)

## appsTotalCount

**Type:** [Int](/api/scalars#int)

## archivedDeals

**Type:** [[Deal]](/api/objects#deal)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
priorities<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedDealsCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
pipelineId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedGrowthHacks

**Type:** [[GrowthHack]](/api/objects#growthhack)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
labelIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
priorities<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedGrowthHacksCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
labelIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
priorities<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedStages

**Type:** [[Stage]](/api/objects#stage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedStagesCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTasks

**Type:** [[Task]](/api/objects#task)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
priorities<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTasksCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
pipelineId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTickets

**Type:** [[Ticket]](/api/objects#ticket)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
priorities<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sources<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## archivedTicketsCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
pipelineId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
priorities<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sources<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## automationConfigPrievewCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## automationDetail

**Type:** [Automation](/api/objects#automation)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## automationHistories

**Type:** [[AutomationHistory]](/api/objects#automationhistory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
automationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
beginDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
</tbody>
</table>

## automationNotes

**Type:** [[AutomationNote]](/api/objects#automationnote)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
automationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
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

## automations

**Type:** [[Automation]](/api/objects#automation)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## automationsMain

**Type:** [AutomationsListResponse](/api/objects#automationslistresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## automationsTotalCount

**Type:** [automationsTotalCountResponse](/api/objects#automationstotalcountresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## boardContentTypeDetail

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
</tbody>
</table>

## boardCounts

**Type:** [[BoardCount]](/api/objects#boardcount)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## boardDetail

**Type:** [Board](/api/objects#board)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## boardGetLast

**Type:** [Board](/api/objects#board)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## boardLogs

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
</tbody>
</table>

## boards

**Type:** [[Board]](/api/objects#board)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## branchDetail

**Type:** [Branch](/api/objects#branch)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## branches

**Type:** [[Branch]](/api/objects#branch)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## brandDetail

**Type:** [Brand](/api/objects#brand)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## brands

**Type:** [[Brand]](/api/objects#brand)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## brandsGetLast

**Type:** [Brand](/api/objects#brand)

## brandsTotalCount

**Type:** [Int](/api/scalars#int)

## cardsFields

**Type:** [JSON](/api/scalars#json)

## channelDetail

**Type:** [Channel](/api/objects#channel)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## channels

**Type:** [[Channel]](/api/objects#channel)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## channelsByMembers

**Type:** [[Channel]](/api/objects#channel)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
memberIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## channelsGetLast

**Type:** [Channel](/api/objects#channel)

## channelsTotalCount

**Type:** [Int](/api/scalars#int)

## chatDetail

**Type:** [Chat](/api/objects#chat)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## chatMessageDetail

**Type:** [ChatMessage](/api/objects#chatmessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## chatMessages

**Type:** [ChatMessageResponse](/api/objects#chatmessageresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
chatId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## chats

**Type:** [ChatResponse](/api/objects#chatresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/enums#chattype"><code>ChatType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checkDiscount

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
products<br />
<a href="/api/inputObjects#productfield"><code>[ProductField]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## checklistDetail

**Type:** [Checklist](/api/objects#checklist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## checklists

**Type:** [[Checklist]](/api/objects#checklist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
</tbody>
</table>

## checkLoyalties

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
products<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalConfigsTotalCount

**Type:** [Int](/api/scalars#int)

## clientPortalCurrentUser

**Type:** [ClientPortalUser](/api/objects#clientportaluser)

## clientPortalGetConfig

**Type:** [ClientPortal](/api/objects#clientportal)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## clientPortalGetConfigByDomain

**Type:** [ClientPortal](/api/objects#clientportal)

## clientPortalGetConfigs

**Type:** [[ClientPortal]](/api/objects#clientportal)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalGetLast

**Type:** [ClientPortal](/api/objects#clientportal)

## clientPortalGetTasks

**Type:** [[Task]](/api/objects#task)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
stageId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalGetTaskStages

**Type:** [[Stage]](/api/objects#stage)

## clientPortalKnowledgeBaseArticles

**Type:** [[KnowledgeBaseArticle]](/api/objects#knowledgebasearticle)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalKnowledgeBaseTopicDetail

**Type:** [KnowledgeBaseTopic](/api/objects#knowledgebasetopic)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## clientPortalTicket

**Type:** [Ticket](/api/objects#ticket)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## clientPortalTickets

**Type:** [[Ticket]](/api/objects#ticket)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
email<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## clientPortalUserCounts

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## clientPortalUserDetail

**Type:** [ClientPortalUser](/api/objects#clientportaluser)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## clientPortalUsers

**Type:** [[ClientPortalUser]](/api/objects#clientportaluser)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cpId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## clientPortalUsersMain

**Type:** [clientPortalUsersListResponse](/api/objects#clientportaluserslistresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
cpId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## commentCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## comments

**Type:** [CommentResponse](/api/objects#commentresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companies

**Type:** [[Company]](/api/objects#company)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companiesMain

**Type:** [CompaniesListResponse](/api/objects#companieslistresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companyCounts

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
brand<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
only<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## companyDetail

**Type:** [Company](/api/objects#company)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## configs

**Type:** [[Config]](/api/objects#config)

## configsCheckActivateInstallation

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
hostname<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## configsCheckPremiumService

**Type:** [Boolean](/api/scalars#boolean)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## configsConstants

**Type:** [JSON](/api/scalars#json)

## configsGetEmailTemplate

**Type:** [String](/api/scalars#string)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## configsGetEnv

**Type:** [ENV](/api/objects#env)

## configsGetValue

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
code<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## configsGetVersion

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
releaseNotes<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## contactsLogs

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
</tbody>
</table>

## conversationCounts

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awaitingResponse<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
channelId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
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
integrationType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
only<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participating<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
starred<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unassigned<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationDetail

**Type:** [Conversation](/api/objects#conversation)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## conversationMessage

**Type:** [ConversationMessage](/api/objects#conversationmessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## conversationMessages

**Type:** [[ConversationMessage]](/api/objects#conversationmessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
getFirst<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationMessagesTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## conversations

**Type:** [[Conversation]](/api/objects#conversation)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awaitingResponse<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
channelId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
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
integrationType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participating<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
starred<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unassigned<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationsGetLast

**Type:** [Conversation](/api/objects#conversation)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awaitingResponse<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
channelId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
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
integrationType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participating<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
starred<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unassigned<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
awaitingResponse<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
channelId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
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
integrationType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
participating<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
starred<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unassigned<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## conversationsTotalUnreadCount

**Type:** [Int](/api/scalars#int)

## convertToInfo

**Type:** [ConvertTo](/api/objects#convertto)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## cpDonateCampaigns

**Type:** [[DonateCampaign]](/api/objects#donatecampaign)

## cpLotteryCampaigns

**Type:** [[LotteryCampaign]](/api/objects#lotterycampaign)

## cpSpinCampaigns

**Type:** [[SpinCampaign]](/api/objects#spincampaign)

## cpVoucherCampaigns

**Type:** [[VoucherCampaign]](/api/objects#vouchercampaign)

## currentUser

**Type:** [User](/api/objects#user)

## customerCounts

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
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
brand<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
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
integration<br />
<a href="/api/scalars#string"><code>String</code></a>
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
only<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
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
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
startDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
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

## customerDetail

**Type:** [Customer](/api/objects#customer)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## customers

**Type:** [[Customer]](/api/objects#customer)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
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
brand<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
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
integration<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
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
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
tag<br />
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

## customersMain

**Type:** [CustomersListResponse](/api/objects#customerslistresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
autoCompletion<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
autoCompletionType<br />
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
brand<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
form<br />
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
integration<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
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
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
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
tag<br />
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

## dashboardDetails

**Type:** [Dashboard](/api/objects#dashboard)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## dashboardFilters

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## dashboardInitialDatas

**Type:** [[DashboardItem]](/api/objects#dashboarditem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## dashboardItemDetail

**Type:** [DashboardItem](/api/objects#dashboarditem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## dashboardItems

**Type:** [[DashboardItem]](/api/objects#dashboarditem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
dashboardId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboards

**Type:** [[Dashboard]](/api/objects#dashboard)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dashboardsTotalCount

**Type:** [Int](/api/scalars#int)

## dealDetail

**Type:** [Deal](/api/objects#deal)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## deals

**Type:** [[DealListItem]](/api/objects#deallistitem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
<tr>
<td>
priority<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedStartDate<br />
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
</tbody>
</table>

## dealsTotalAmounts

**Type:** [[TotalForType]](/api/objects#totalfortype)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
noSkipArchive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
<tr>
<td>
priority<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## dealsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
noSkipArchive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
<tr>
<td>
priority<br />
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
stageChangedStartDate<br />
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
</tbody>
</table>

## departmentDetail

**Type:** [Department](/api/objects#department)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## departments

**Type:** [[Department]](/api/objects#department)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateCampaignDetail

**Type:** [DonateCampaign](/api/objects#donatecampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## donateCampaigns

**Type:** [[DonateCampaign]](/api/objects#donatecampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateCampaignsCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## donateDetail

**Type:** [Donate](/api/objects#donate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## donates

**Type:** [[Donate]](/api/objects#donate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## donatesMain

**Type:** [DonateMain](/api/objects#donatemain)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## ecommerceGetBranches

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
posToken<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailDeliveriesAsLogs

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## emailDeliveryDetail

**Type:** [EmailDelivery](/api/objects#emaildelivery)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## emailTemplates

**Type:** [[EmailTemplate]](/api/objects#emailtemplate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
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

## emailTemplatesTotalCount

**Type:** [Int](/api/scalars#int)

## emojiCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
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

## emojiIsReacted

**Type:** [Boolean](/api/scalars#boolean)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
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

## emojiReactedUsers

**Type:** [[User]](/api/objects#user)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentType<br />
<a href="/api/enums#reactioncontenttype"><code>ReactionContentType!</code></a>
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

## enabledServices

**Type:** [JSON](/api/scalars#json)

## engageEmailPercentages

**Type:** [AvgEmailStats](/api/objects#avgemailstats)

## engageLogs

**Type:** [[EngageLog]](/api/objects#engagelog)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
engageMessageId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessageCounts

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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

## engageMessageDetail

**Type:** [EngageMessage](/api/objects#engagemessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## engageMessages

**Type:** [[EngageMessage]](/api/objects#engagemessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
<tr>
<td>
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageMessagesTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
ids<br />
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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
<tr>
<td>
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## engageReportsList

**Type:** [EngageDeliveryReport](/api/objects#engagedeliveryreport)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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

## engagesConfigDetail

**Type:** [JSON](/api/scalars#json)

## engageSmsDeliveries

**Type:** [DeliveryList](/api/objects#deliverylist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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

## engageVerifiedEmails

**Type:** [[String]](/api/scalars#string)

## exmFeed

**Type:** [ExmFeedResponse](/api/objects#exmfeedresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
bravoType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
contentTypes<br />
<a href="/api/enums#contenttype"><code>[ContentType]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
recipientType<br />
<a href="/api/enums#recipienttype"><code>RecipientType</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
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
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/enums#sourcetype"><code>SourceType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedCeremonies

**Type:** [ExmFeedResponse](/api/objects#exmfeedresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/api/enums#contenttype"><code>ContentType</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterType<br />
<a href="/api/enums#filtertype"><code>FilterType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmFeedDetail

**Type:** [ExmFeed](/api/objects#exmfeed)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## exmGet

**Type:** [Exm](/api/objects#exm)

## exms

**Type:** [ExmList](/api/objects#exmlist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## exmThanks

**Type:** [ExmThankResponse](/api/objects#exmthankresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
type<br />
<a href="/api/enums#sourcetype"><code>SourceType</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fields

**Type:** [[Field]](/api/objects#field)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
isVisible<br />
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
pipelineId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## fieldsCombinedByContentType

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludedNames<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segmentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
usageType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsDefaultColumnsConfig

**Type:** [[ColumnConfigItem]](/api/objects#columnconfigitem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## fieldsGetTypes

**Type:** [[JSON]](/api/scalars#json)

## fieldsGroups

**Type:** [[FieldsGroup]](/api/objects#fieldsgroup)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
contentType<br />
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
</tbody>
</table>

## formDetail

**Type:** [Form](/api/objects#form)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## forms

**Type:** [[Form]](/api/objects#form)

## formSubmissions

**Type:** [[Submission]](/api/objects#submission)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filters<br />
<a href="/api/inputObjects#submissionfilter"><code>[SubmissionFilter]</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tagId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## formSubmissionsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
filters<br />
<a href="/api/inputObjects#submissionfilter"><code>[SubmissionFilter]</code></a>
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
tagId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## getChatIdByUserIds

**Type:** [String](/api/scalars#string)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## getDbSchemaLabels

**Type:** [[SchemaField]](/api/objects#schemafield)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## getDealLink

**Type:** [String](/api/scalars#string)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## getNeighbor

**Type:** [Neighbor](/api/objects#neighbor)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
productCategoryId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## getNeighborItem

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## getNeighborItems

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## getSystemFieldsGroup

**Type:** [FieldsGroup](/api/objects#fieldsgroup)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## getUnreadChatCount

**Type:** [Int](/api/scalars#int)

## growthHackDetail

**Type:** [GrowthHack](/api/objects#growthhack)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## growthHacks

**Type:** [[GrowthHack]](/api/objects#growthhack)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStage<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksPriorityMatrix

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
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
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## growthHacksTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hackStage<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
initialStageId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
userIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistories

**Type:** [ImportHistoryList](/api/objects#importhistorylist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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

## importHistoryDetail

**Type:** [ImportHistory](/api/objects#importhistory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## importHistoryGetColumns

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistoryGetDuplicatedHeaders

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
attachmentNames<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## importHistoryGetExportableServices

**Type:** [JSON](/api/scalars#json)

## importHistoryGetTypes

**Type:** [JSON](/api/scalars#json)

## importHistoryPreviewExportCount

**Type:** [String](/api/scalars#string)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
segmentId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## inboxFields

**Type:** [InboxField](/api/objects#inboxfield)

## integrationDetail

**Type:** [Integration](/api/objects#integration)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## integrationGetLineWebhookUrl

**Type:** [String](/api/scalars#string)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## integrations

**Type:** [[Integration]](/api/objects#integration)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
channelId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formLoadType<br />
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsConversationFbComments

**Type:** [[FacebookComment]](/api/objects#facebookcomment)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
isResolved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
postId<br />
<a href="/api/scalars#string"><code>String!</code></a>
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
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsConversationFbCommentsCount

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
postId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsGetAccounts

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## integrationsGetConfigs

**Type:** [JSON](/api/scalars#json)

## integrationsGetFbPages

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
accountId<br />
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
</tbody>
</table>

## integrationsGetIntegrationDetail

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
erxesApiId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## integrationsGetIntegrations

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## integrationsGetUsedTypes

**Type:** [[integrationsGetUsedTypes]](/api/objects#integrationsgetusedtypes)

## integrationsTotalCount

**Type:** [integrationsTotalCount](/api/objects#integrationstotalcount)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
channelId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
formLoadType<br />
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
status<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## internalNoteDetail

**Type:** [InternalNote](/api/objects#internalnote)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## internalNotes

**Type:** [[InternalNote]](/api/objects#internalnote)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
</tbody>
</table>

## internalNotesAsLogs

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## internalNotesByAction

**Type:** [InternalNotesByAction](/api/objects#internalnotesbyaction)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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

## itemsCountByAssignedUser

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
stackBy<br />
<a href="/api/scalars#string"><code>String</code></a>
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

## itemsCountBySegments

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
pipelineId<br />
<a href="/api/scalars#string"><code>String</code></a>
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

## knowledgeBaseArticleDetail

**Type:** [KnowledgeBaseArticle](/api/objects#knowledgebasearticle)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## knowledgeBaseArticleDetailAndIncViewCount

**Type:** [KnowledgeBaseArticle](/api/objects#knowledgebasearticle)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## knowledgeBaseArticles

**Type:** [[KnowledgeBaseArticle]](/api/objects#knowledgebasearticle)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseArticlesTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
categoryIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategories

**Type:** [[KnowledgeBaseCategory]](/api/objects#knowledgebasecategory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
topicIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoriesGetLast

**Type:** [KnowledgeBaseCategory](/api/objects#knowledgebasecategory)

## knowledgeBaseCategoriesTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
topicIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseCategoryDetail

**Type:** [KnowledgeBaseCategory](/api/objects#knowledgebasecategory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## knowledgeBaseTopicDetail

**Type:** [KnowledgeBaseTopic](/api/objects#knowledgebasetopic)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## knowledgeBaseTopics

**Type:** [[KnowledgeBaseTopic]](/api/objects#knowledgebasetopic)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## knowledgeBaseTopicsTotalCount

**Type:** [Int](/api/scalars#int)

## logs

**Type:** [LogList](/api/objects#loglist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
end<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
start<br />
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
</tbody>
</table>

## lotteries

**Type:** [[Lottery]](/api/objects#lottery)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteriesCampaignCustomerList

**Type:** [LotteryMain](/api/objects#lotterymain)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteriesMain

**Type:** [LotteryMain](/api/objects#lotterymain)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignDetail

**Type:** [LotteryCampaign](/api/objects#lotterycampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## lotteryCampaigns

**Type:** [[LotteryCampaign]](/api/objects#lotterycampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignsCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryCampaignWinnerList

**Type:** [LotteryMain](/api/objects#lotterymain)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
campaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## lotteryDetail

**Type:** [Lottery](/api/objects#lottery)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## loyalties

**Type:** [Loyalty](/api/objects#loyalty)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
statuses<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## loyaltyConfigs

**Type:** [[LoyaltyConfig]](/api/objects#loyaltyconfig)

## messengerApps

**Type:** [MessengerAppsResponse](/api/objects#messengerappsresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
integrationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## noDepartmentUsers

**Type:** [[User]](/api/objects#user)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
excludeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationCounts

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
requireRead<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notifications

**Type:** [[Notification]](/api/objects#notification)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireRead<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
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
title<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## notificationsGetConfigurations

**Type:** [[NotificationConfiguration]](/api/objects#notificationconfiguration)

## notificationsModules

**Type:** [[JSON]](/api/scalars#json)

## onboardingGetAvailableFeatures

**Type:** [[OnboardingGetAvailableFeaturesResponse]](/api/objects#onboardinggetavailablefeaturesresponse)

## onboardingStepsCompleteness

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
steps<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## permissionActions

**Type:** [[PermissionAction]](/api/objects#permissionaction)

## permissionModules

**Type:** [[PermissionModule]](/api/objects#permissionmodule)

## permissions

**Type:** [[Permission]](/api/objects#permission)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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

## permissionsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
userId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineAssignedUsers

**Type:** [[User]](/api/objects#user)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## pipelineDetail

**Type:** [Pipeline](/api/objects#pipeline)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## pipelineLabelDetail

**Type:** [PipelineLabel](/api/objects#pipelinelabel)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## pipelineLabels

**Type:** [[PipelineLabel]](/api/objects#pipelinelabel)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
pipelineId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelines

**Type:** [[Pipeline]](/api/objects#pipeline)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
isAll<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
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

## pipelineStateCount

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
type<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## pipelineTemplateDetail

**Type:** [PipelineTemplate](/api/objects#pipelinetemplate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## pipelineTemplates

**Type:** [[PipelineTemplate]](/api/objects#pipelinetemplate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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

## pipelineTemplatesTotalCount

**Type:** [Int](/api/scalars#int)

## posDetail

**Type:** [Pos](/api/objects#pos)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## posEnv

**Type:** [JSON](/api/scalars#json)

## posList

**Type:** [[Pos]](/api/objects#pos)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
isOnline<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## posOrderDetail

**Type:** [PosOrderDetail](/api/objects#posorderdetail)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## posOrders

**Type:** [[PosOrder]](/api/objects#posorder)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
createdEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdStartDate<br />
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## posOrdersSummary

**Type:** [JSON](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
createdEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdStartDate<br />
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## posProducts

**Type:** [PosProducts](/api/objects#posproducts)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
createdEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdStartDate<br />
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## posSlots

**Type:** [[PosSlot]](/api/objects#posslot)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
posId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## productCategories

**Type:** [[ProductCategory]](/api/objects#productcategory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
searchValue<br />
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

## productCategoriesTotalCount

**Type:** [Int](/api/scalars#int)

## productCategoryDetail

**Type:** [ProductCategory](/api/objects#productcategory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## productCountByTags

**Type:** [JSON](/api/scalars#json)

## productDetail

**Type:** [Product](/api/objects#product)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## productGroups

**Type:** [[ProductGroups]](/api/objects#productgroups)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
posId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## products

**Type:** [[Product]](/api/objects#product)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
categoryId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
tag<br />
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

## productsConfigs

**Type:** [[ProductsConfig]](/api/objects#productsconfig)

## productsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## putResponses

**Type:** [[PutResponse]](/api/objects#putresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
billIdRule<br />
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
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLast<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
orderNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
success<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## putResponsesAmount

**Type:** [Float](/api/scalars#float)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
billIdRule<br />
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
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLast<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
orderNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
success<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## putResponsesCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
billIdRule<br />
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
contentType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdEndDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
createdStartDate<br />
<a href="/api/scalars#date"><code>Date</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
dealName<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isLast<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
orderNumber<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
paidDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
success<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplates

**Type:** [[ResponseTemplate]](/api/objects#responsetemplate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## responseTemplatesTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## robotEntries

**Type:** [[RobotEntry]](/api/objects#robotentry)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
isNotified<br />
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
</tbody>
</table>

## scoreLogList

**Type:** [List](/api/objects#list)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
fromDate<br />
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
orderType<br />
<a href="/api/scalars#string"><code>String</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
toDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scoreLogs

**Type:** [[ScoreLog]](/api/objects#scorelog)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## scripts

**Type:** [[Script]](/api/objects#script)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## scriptsTotalCount

**Type:** [Int](/api/scalars#int)

## search

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
value<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentDetail

**Type:** [Segment](/api/objects#segment)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## segments

**Type:** [[Segment]](/api/objects#segment)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
contentTypes<br />
<a href="/api/scalars#string"><code>[String]!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentsEvents

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentsGetAssociationTypes

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentType<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## segmentsGetHeads

**Type:** [[Segment]](/api/objects#segment)

## segmentsGetTypes

**Type:** [[JSON]](/api/scalars#json)

## segmentsPreviewCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
subOf<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## skill

**Type:** [Skill](/api/objects#skill)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## skills

**Type:** [[Skill]](/api/objects#skill)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
list<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
typeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## skillsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
typeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## skillTypes

**Type:** [[SkillType]](/api/objects#skilltype)

## skillTypesTotalCount

**Type:** [Int](/api/scalars#int)

## spinCampaignDetail

**Type:** [SpinCampaign](/api/objects#spincampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## spinCampaigns

**Type:** [[SpinCampaign]](/api/objects#spincampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinCampaignsCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinDetail

**Type:** [Spin](/api/objects#spin)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## spins

**Type:** [[Spin]](/api/objects#spin)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## spinsMain

**Type:** [SpinMain](/api/objects#spinmain)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
voucherCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stageDetail

**Type:** [Stage](/api/objects#stage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
extraParams<br />
<a href="/api/scalars#json"><code>JSON</code></a>
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
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## stages

**Type:** [[Stage]](/api/objects#stage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
extraParams<br />
<a href="/api/scalars#json"><code>JSON</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isAll<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
isNotLost<br />
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
pipelineId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## structureDetail

**Type:** [Structure](/api/objects#structure)

## tagDetail

**Type:** [Tag](/api/objects#tag)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## tags

**Type:** [[Tag]](/api/objects#tag)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchValue<br />
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
</tbody>
</table>

## tagsGetTypes

**Type:** [[JSON]](/api/scalars#json)

## taskDetail

**Type:** [Task](/api/objects#task)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## tasks

**Type:** [[TaskListItem]](/api/objects#tasklistitem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## tasksAsLogs

**Type:** [[JSON]](/api/scalars#json)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentId<br />
<a href="/api/scalars#string"><code>String!</code></a>
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## tasksTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
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
</tbody>
</table>

## ticketDetail

**Type:** [Ticket](/api/objects#ticket)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## tickets

**Type:** [[TicketListItem]](/api/objects#ticketlistitem)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
</tbody>
</table>

## ticketsTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
assignedToMe<br />
<a href="/api/scalars#string"><code>String</code></a>
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
closeDateType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
companyIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsRelated<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityIsSaved<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainType<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityMainTypeId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
conformityRelType<br />
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
date<br />
<a href="/api/inputObjects#itemdate"><code>ItemDate</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
endDate<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
hasStartAndCloseDate<br />
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
limit<br />
<a href="/api/scalars#int"><code>Int</code></a>
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
<tr>
<td>
priority<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
search<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
segment<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
skip<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
source<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
</tbody>
</table>

## transactionEmailDeliveries

**Type:** [EmailDeliveryList](/api/objects#emaildeliverylist)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## unitDetail

**Type:** [Unit](/api/objects#unit)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## units

**Type:** [[Unit]](/api/objects#unit)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## uoms

**Type:** [[Uom]](/api/objects#uom)

## uomsTotalCount

**Type:** [Int](/api/scalars#int)

## userConversations

**Type:** [UserConversationListResponse](/api/objects#userconversationlistresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## userDetail

**Type:** [User](/api/objects#user)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## users

**Type:** [[User]](/api/objects#user)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
brandIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
excludeIds<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
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
isActive<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
requireUsername<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
unitId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroups

**Type:** [[UsersGroup]](/api/objects#usersgroup)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## usersGroupsTotalCount

**Type:** [Int](/api/scalars#int)

## usersTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
brandIds<br />
<a href="/api/scalars#string"><code>[String]</code></a>
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
ids<br />
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
requireUsername<br />
<a href="/api/scalars#boolean"><code>Boolean</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
unitId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## voucherCampaignDetail

**Type:** [VoucherCampaign](/api/objects#vouchercampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## voucherCampaigns

**Type:** [[VoucherCampaign]](/api/objects#vouchercampaign)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
equalTypeCampaignId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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
</tbody>
</table>

## voucherCampaignsCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
_ids<br />
<a href="/api/scalars#string"><code>[String]</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
filterStatus<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## voucherDetail

**Type:** [Voucher](/api/objects#voucher)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## vouchers

**Type:** [[Voucher]](/api/objects#voucher)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## vouchersMain

**Type:** [VoucherMain](/api/objects#vouchermain)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
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
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortDirection<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
sortField<br />
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

## webbuilderContentTypeDetail

**Type:** [WebbuilderContentType](/api/objects#webbuildercontenttype)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## webbuilderContentTypes

**Type:** [[WebbuilderContentType]](/api/objects#webbuildercontenttype)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderContentTypesTotalCount

**Type:** [Int](/api/scalars#int)

## webbuilderEntries

**Type:** [[WebbuilderEntry]](/api/objects#webbuilderentry)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderEntriesTotalCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
contentTypeId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderEntryDetail

**Type:** [WebbuilderEntry](/api/objects#webbuilderentry)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## webbuilderPageDetail

**Type:** [WebbuilderPage](/api/objects#webbuilderpage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## webbuilderPages

**Type:** [[WebbuilderPage]](/api/objects#webbuilderpage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
searchValue<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderPagesTotalCount

**Type:** [Int](/api/scalars#int)

## webbuilderSites

**Type:** [[WebbuilderSite]](/api/objects#webbuildersite)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderSitesTotalCount

**Type:** [Int](/api/scalars#int)

## webbuilderTemplateDetail

**Type:** [WebbuilderTemplate](/api/objects#webbuildertemplate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## webbuilderTemplates

**Type:** [[WebbuilderTemplate]](/api/objects#webbuildertemplate)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
page<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
perPage<br />
<a href="/api/scalars#int"><code>Int</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## webbuilderTemplatesTotalCount

**Type:** [Int](/api/scalars#int)

## widgetsBookingProductWithFields

**Type:** [BookingProduct](/api/objects#bookingproduct)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## widgetsConversationDetail

**Type:** [ConversationDetailResponse](/api/objects#conversationdetailresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
integrationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsConversations

**Type:** [[Conversation]](/api/objects#conversation)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
integrationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
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

## widgetsGetEngageMessage

**Type:** [ConversationMessage](/api/objects#conversationmessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
browserInfo<br />
<a href="/api/scalars#json"><code>JSON!</code></a>
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
visitorId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsGetMessengerIntegration

**Type:** [Integration](/api/objects#integration)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
brandCode<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsKnowledgeBaseArticles

**Type:** [[KnowledgeBaseArticle]](/api/objects#knowledgebasearticle)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
searchString<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
<tr>
<td>
topicId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsKnowledgeBaseTopicDetail

**Type:** [KnowledgeBaseTopic](/api/objects#knowledgebasetopic)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## widgetsMessages

**Type:** [[ConversationMessage]](/api/objects#conversationmessage)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsMessengerSupporters

**Type:** [MessengerSupportersResponse](/api/objects#messengersupportersresponse)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
integrationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>

## widgetsProductCategory

**Type:** [ProductCategory](/api/objects#productcategory)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
</tbody>
</table>

## widgetsTotalUnreadCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

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
integrationId<br />
<a href="/api/scalars#string"><code>String!</code></a>
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

## widgetsUnreadCount

**Type:** [Int](/api/scalars#int)

<p style={{ marginBottom: "0.4em" }}><strong>Arguments</strong></p>

<table>
<thead><tr><th>Name</th><th>Description</th></tr></thead>
<tbody>
<tr>
<td>
conversationId<br />
<a href="/api/scalars#string"><code>String</code></a>
</td>
<td>

</td>
</tr>
</tbody>
</table>
