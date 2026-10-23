---
name: operation
description: Operation (project management) playbook with verified GraphQL. Load for tasks (overdue, assigned to me, created by me, in a project, a person's work since a date), project reports, teams and members, cycles, triage, task activity, and creating or updating tasks, projects or teams.
---

Every document below ran against the live API. Use them as written and skip `searchGraphql` for these fields. Resolve every name to an id first, then filter by id.

## Domain map

- A **team** owns its statuses, cycles and members. A **project** belongs to one or more teams (`teamIds`). A **task** has exactly one `teamId` and optional `projectId`, `cycleId`, `milestoneId`.
- `Task.status` is a status `_id` scoped to the task's team. The status kind is the status `type`: 1 started (in progress), 2 unstarted (todo), 3 backlog, 4 completed (done), 5 cancelled, 6 triage. `statusType` exists only as a filter key, never as a Task field. Read kinds and names from `getStatusesChoicesByTeam`, where `value` equals `Task.status`. Filter by kind with `filter.statusType`.
- `Project.status` holds the same kind integer directly (1 to 5), so projects need no status lookup.
- `priority` (tasks and projects): 0 none, 1 minor, 2 medium, 3 high, 4 critical.
- People are bare ids: `assigneeId`, `createdBy`, `leadId`, `memberIds`. Tasks and projects have no nested user. Resolve names with one `users(ids:)` call and show `details.firstName details.lastName`, falling back to `email`.
- `description` is a BlockNote JSON string. Read the text from `blocks[].content[].text`.
- Dates are ISO strings in UTC.

## Resolve ids

```graphql
query Me { currentUser { _id email details { firstName lastName } } }
```
"Me", "my", "миний", "надад" all mean `currentUser._id`.

```graphql
query Users($searchValue: String, $ids: [String], $isActive: Boolean) {
  users(searchValue: $searchValue, ids: $ids, isActive: $isActive, limit: 100) {
    list { _id email details { firstName lastName } }
    totalCount
  }
}
```
Pass `searchValue` to find a person by name or email, or `ids` to label a result set. `users` returns `{ list totalCount }`, never a bare array. It returns active users only. Ids still missing after a call belong to deactivated users: repeat with `isActive: false`, which returns only those.

```graphql
query Teams($userId: String) {
  getTeams(userId: $userId) { _id name icon memberCount taskCount cycleEnabled triageEnabled }
}
```
`getTeams(name:)` matches the exact stored name only. To find a team by name, fetch all teams (a short list) and match case-insensitively yourself. `userId` returns that user's teams.

```graphql
query Projects($filter: IProjectFilter) {
  getProjects(filter: $filter) {
    list { _id name status priority teamIds leadId memberIds startDate targetDate }
    totalCount
    pageInfo { hasNextPage endCursor }
  }
}
```
`filter.name` is a case-insensitive substring. Other useful keys: `teamIds: [id]`, `active: true` (status not done or cancelled), `memberId` (lead or member), `userId` (projects of my teams, or where I lead or am a member), `limit`.

```graphql
query Statuses($teamId: String!) { getStatusesChoicesByTeam(teamId: $teamId) { value label type } }
query Members($teamId: String, $teamIds: [String]) { getTeamMembers(teamId: $teamId, teamIds: $teamIds) { memberId member { _id email details { firstName lastName } } } }
```
Fetch statuses once per distinct `teamId` in a result set. `getTeamMembers` takes `teamId` or `teamIds` and returns users nested, so it needs no extra `users` call.

When a name matches several teams, projects or people, list the candidates and ask which one.

## Tasks: one document, many filters

```graphql
query Tasks($filter: ITaskFilter) {
  getTasks(filter: $filter) {
    list { _id number name status priority teamId projectId cycleId assigneeId createdBy startDate targetDate statusChangedDate createdAt updatedAt }
    totalCount
    pageInfo { hasNextPage endCursor }
  }
}
```

| Prompt | `filter` |
|---|---|
| Assigned to me | `{ assigneeId: ME, limit: 100 }` |
| I created | `{ createdBy: ME, limit: 100 }` |
| Overdue | three calls, `statusType` 1, 2 and 3, each with `{ targetDateEndDate: NOW_ISO, limit: 100 }`. Overdue is the sum of the three `totalCount`s. Add `assigneeId` or `teamId` to scope it. |
| In project X | `{ projectId: P, limit: 100 }` |
| Person's work since a date | `{ assigneeId: U, updatedStartDate: D }` for touched work, `{ assigneeId: U, completedStartDate: D }` for finished work, `{ createdBy: U, createdStartDate: D }` for work they opened. Merge by `_id`. |
| Done in a period | `{ completedStartDate: D1, completedEndDate: D2 }` (filters `statusChangedDate` and forces kind 4) |
| Current cycle | `{ teamId: T, cycleFilter: currentCycle }`. Others: `noCycle previousCycle upcomingCycle anyPastCycle anyFutureCycle`. All need `teamId`. When the team has no such cycle, the server drops the cycle filter and returns every team task, so check `getCyclesActive` or `getCycles` first. |
| Unassigned, no project | `assigneeId: "no-assignee"`, `projectId: "no-project"` |
| By name | `name: "text"` (case-insensitive substring) |

Filter semantics:
- Keys combine with AND and match by equality. "Assigned to OR created by" takes two calls merged by `_id`.
- `priority: 0` and `statusType: 0` are dropped as falsy and match everything. Filter "no priority" on the returned rows.
- With `projectId` set, the server ignores `teamId`.
- Range keys come in pairs: `startDate*`, `targetDate*`, `created*`, `updated*`, `completed*`, each `...StartDate` / `...EndDate` (for example `createdStartDate`). A start later than its end is an error. A date-only bound means 00:00 UTC, so write end bounds as `2026-04-30T23:59:59Z`.
- `targetDateEndDate` skips tasks with no due date, which is what overdue wants.

## Project report

Run together: `getProject`, progress, and the task list for `projectId`, then statuses for each `teamIds` entry and `users(ids:)` for every assignee.

```graphql
query ProjectReport($_id: String!) {
  getProject(_id: $_id) { _id name description status priority teamIds leadId memberIds startDate targetDate }
  getProjectProgress(_id: $_id) { totalScope totalStartedScope totalCompletedScope }
  getProjectProgressByMember(_id: $_id) { assigneeId totalScope totalStartedScope totalCompletedScope }
}
query Milestones($projectId: String!) { milestoneProgress(projectId: $projectId) { _id name targetDate totalScope totalStartedScope totalCompletedScope } }
```
Scope counts estimate points, with an unestimated task counting as 1, and excludes cancelled tasks. Say "scope" or "points", not "tasks".

## Cycles, triage, activity

```graphql
query Cycles($teamId: String) { getCycles(teamId: $teamId, limit: 20) { list { _id name startDate endDate isActive isCompleted donePercent } totalCount } }
query ActiveCycles($teamId: String) { getCyclesActive(teamId: $teamId) { list { _id name startDate endDate isActive } totalCount } }
query Triage($filter: ITriageFilter) { operationGetTriageList(filter: $filter) { list { _id number name priority status teamId createdBy createdAt } totalCount } }
query Activity($contentId: String!) {
  getOperationActivities(contentId: $contentId, limit: 50) {
    list { action module metadata { previousValue newValue } createdBy createdAt }
    totalCount
  }
}
```
- Triage filter keys: `teamId`, `createdBy`, `name`, `priority`, `limit`.
- Activity is a history of one task or project (`contentId`). `action` is CREATED, CHANGED or REMOVED. `module` is one of NAME STATUS ASSIGNEE PRIORITY TEAM START_DATE END_DATE ESTIMATE_POINT PROJECT LEAD CYCLE. Metadata values are raw ids or numbers, so map them like task fields.
- A per-person activity feed does not exist. For "what did X do", use the task filters above and say the answer comes from task fields.

## Writes

Every mutation pauses for the user's approval. Call `callGraphql` directly in chat. In code mode a mutation returns `APPROVAL_REQUIRED` and runs nothing. Resolve all ids before proposing the write, and state in plain words what it will create.

```graphql
mutation CreateTask($name: String!, $teamId: String!, $description: String, $status: String, $priority: Int, $startDate: Date, $targetDate: Date, $assigneeId: String, $projectId: String, $cycleId: String, $estimatePoint: Int) {
  createTask(name: $name, teamId: $teamId, description: $description, status: $status, priority: $priority, startDate: $startDate, targetDate: $targetDate, assigneeId: $assigneeId, projectId: $projectId, cycleId: $cycleId, estimatePoint: $estimatePoint) {
    _id number name status priority teamId projectId assigneeId targetDate
  }
}
```
- Required: `name`, `teamId`. The server sets `createdBy`. Without `status`, the task lands in the team's first todo status. "For me" means `assigneeId: ME`.
- `projectId` must belong to the team (`project.teamIds` contains `teamId`), or the call fails with "Task project is not in this team". When the user names only a project, take `teamId` from its `teamIds`, and ask which team when there are several.
- `cycleId` must point to a cycle that is not completed.
- `targetDate` is the due date, an ISO string. Pass `description` as BlockNote JSON: `[{"type":"paragraph","content":[{"type":"text","text":"...","styles":{}}]}]`.

Other writes, with argument names checked against the schema:
- `updateTask(_id: String!, name, description, teamId, status, priority, assigneeId, startDate, targetDate, cycleId, projectId, estimatePoint)`. `status` takes a status `_id` from the task's team.
- `teamAdd(name: String!, icon: String!, description: String, memberIds: [String])`. `icon` is a Tabler icon name such as `"IconUsersGroup"`. The creator joins as admin, so leave them out of `memberIds`.
- `teamAddMembers(_id: String!, memberIds: [String]!)` where `_id` is the team id.
- `createProject(name: String!, teamIds: [String!]!, leadId, memberIds, status: Int, priority: Int, startDate, targetDate, description)`.
- `operationAddTriage(input: { name: String!, teamId: String!, description, priority })`.

## Paging and partial results

- `getTasks`, `getProjects` and `users` accept `limit` from 1 to 100. Above 100 the call errors. The default is 20.
- `totalCount` counts every match. Report counts from `totalCount`, not from `list.length`.
- For the next page, repeat the same filter with `cursor: pageInfo.endCursor` until `hasNextPage` is false. Walk many pages in code mode.
- Default task order is by status name, then most recently updated. Pass `orderBy: { targetDate: 1 }` to sort by due date.
- When you stop before the last page, label it: "showing 100 of 240 overdue tasks", and offer the rest. When a user or status id fails to resolve, print "unknown user" or "unknown status" rather than dropping the row.
