import * as z from 'zod';
import { defineContract } from './define';

const id = z.string().min(1);
const page = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const listOf = <T extends z.ZodType>(item: T) =>
  z.object({
    list: z.array(item).nullable(),
    totalCount: z.number().nullable(),
    pageInfo: PageInfo.nullable(),
  });

const Task = z.object({
  _id: z.string(),
  number: z.number().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  priority: z.number().nullable(),
  teamId: z.string(),
  projectId: z.string().nullable(),
  cycleId: z.string().nullable(),
  milestoneId: z.string().nullable(),
  assigneeId: z.string().nullable(),
  startDate: z.string().nullable(),
  targetDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TaskFilter = z.object({
  name: z.string().optional(),
  teamId: id.optional(),
  projectId: id.optional(),
  cycleId: id.optional(),
  milestoneId: id.optional(),
  assigneeId: id.optional(),
  status: id.optional(),
  priority: z.number().int().optional(),
  ...page,
});

const Project = z.object({
  _id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  description: z.string().nullable(),
  status: z.number().nullable(),
  priority: z.number().nullable(),
  teamIds: z.array(z.string()),
  leadId: z.string().nullable(),
  memberIds: z.array(z.string()).nullable(),
  startDate: z.string().nullable(),
  targetDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ProjectFilter = z.object({
  name: z.string().optional(),
  status: z.number().int().optional(),
  priority: z.number().int().optional(),
  teamIds: z.array(id).optional(),
  leadId: id.optional(),
  active: z.boolean().optional(),
  ...page,
});

const Team = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  icon: z.string().nullable(),
  description: z.string().nullable(),
  estimateType: z.number().nullable(),
  cycleEnabled: z.boolean().nullable(),
  triageEnabled: z.boolean().nullable(),
});

const Status = z.object({
  _id: z.string(),
  name: z.string(),
  teamId: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  order: z.number(),
  type: z.number(),
});

const StatusChoice = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string(),
  type: z.number(),
});

const Cycle = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  teamId: z.string().nullable(),
  isActive: z.boolean().nullable(),
  isCompleted: z.boolean().nullable(),
  donePercent: z.number().nullable(),
});

const Milestone = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  targetDate: z.string().nullable(),
  projectId: z.string(),
});

const Note = z.object({
  _id: z.string(),
  content: z.string().nullable(),
  contentId: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.string().nullable(),
});

// Statuses are the team's workflow states. `type` is 1 started, 2 unstarted,
// 3 backlog, 4 completed, 5 cancelled, 6 triage.
const statusType = z.number().int().min(1).max(6);

export const operationContract = defineContract('operation', 1, [
  {
    name: 'tasks.list',
    description:
      'List tasks, cursor paged. Filter by team, project, cycle, milestone, assignee, status or priority. Pass pageInfo.endCursor as cursor to get the next page while hasNextPage is true. totalCount counts all matches. Read-only. Needs taskRead.',
    kind: 'read',
    field: 'getTasks',
    args: { filter: 'ITaskFilter' },
    input: z.object({ filter: TaskFilter.optional() }).strict(),
    output: listOf(Task),
  },
  {
    name: 'tasks.get',
    description:
      'Read one task by _id. Returns null when no task has that _id. Read-only. Needs taskRead.',
    kind: 'read',
    field: 'getTask',
    args: { _id: 'String!' },
    notFound: 'Task not found',
    input: z.object({ _id: id }).strict(),
    output: Task.nullable(),
  },
  {
    name: 'tasks.create',
    description:
      'Create a task in a team. status is a status _id for that team, from statuses.choices. Dates are ISO 8601 strings. Needs taskCreate.',
    kind: 'write',
    field: 'createTask',
    args: {
      name: 'String!',
      description: 'String',
      teamId: 'String!',
      status: 'String',
      priority: 'Int',
      assigneeId: 'String',
      projectId: 'String',
      cycleId: 'String',
      milestoneId: 'String',
      startDate: 'Date',
      targetDate: 'Date',
    },
    input: z
      .object({
        name: id,
        description: z.string().optional(),
        teamId: id,
        status: id,
        priority: z.number().int().optional(),
        assigneeId: id.optional(),
        projectId: id.optional(),
        cycleId: id.optional(),
        milestoneId: id.optional(),
        startDate: z.string().optional(),
        targetDate: z.string().optional(),
      })
      .strict(),
    output: Task,
  },
  {
    name: 'tasks.edit',
    description:
      'Change the name, description, priority, dates, project, cycle or milestone of a task. Pass only the fields to change. Use tasks.assign or tasks.changeStatus for assignee and status. Needs taskUpdate.',
    kind: 'write',
    field: 'updateTask',
    args: {
      _id: 'String!',
      name: 'String',
      description: 'String',
      priority: 'Int',
      startDate: 'Date',
      targetDate: 'Date',
      projectId: 'String',
      cycleId: 'String',
      milestoneId: 'String',
    },
    input: z
      .object({
        _id: id,
        name: id.optional(),
        description: z.string().optional(),
        priority: z.number().int().optional(),
        startDate: z.string().optional(),
        targetDate: z.string().optional(),
        projectId: id.optional(),
        cycleId: id.optional(),
        milestoneId: id.optional(),
      })
      .strict(),
    output: Task,
  },
  {
    name: 'tasks.remove',
    description:
      'Delete a task by _id and return it. Destructive. Needs taskRemove.',
    kind: 'destructive',
    field: 'removeTask',
    args: { _id: 'String!' },
    input: z.object({ _id: id }).strict(),
    output: Task,
  },
  {
    name: 'tasks.assign',
    description: 'Set the assignee of a task to a user _id. Needs taskUpdate.',
    kind: 'write',
    field: 'updateTask',
    args: { _id: 'String!', assigneeId: 'String' },
    input: z.object({ _id: id, assigneeId: id }).strict(),
    output: Task,
  },
  {
    name: 'tasks.changeStatus',
    description:
      'Move a task to another status. status is a status _id from statuses.choices for the task team. Needs taskUpdate.',
    kind: 'write',
    field: 'updateTask',
    args: { _id: 'String!', status: 'String' },
    input: z.object({ _id: id, status: id }).strict(),
    output: Task,
  },
  {
    name: 'projects.list',
    description:
      'List projects, cursor paged. Filter by name, status, priority, team, lead, or active only. Pass pageInfo.endCursor as cursor to get the next page while hasNextPage is true. Read-only. Needs projectRead.',
    kind: 'read',
    field: 'getProjects',
    args: { filter: 'IProjectFilter' },
    input: z.object({ filter: ProjectFilter.optional() }).strict(),
    output: listOf(Project),
  },
  {
    name: 'projects.get',
    description:
      'Read one project by _id. Returns null when no project has that _id. Read-only. Needs projectRead.',
    kind: 'read',
    field: 'getProject',
    args: { _id: 'String!' },
    notFound: 'Project not found',
    input: z.object({ _id: id }).strict(),
    output: Project.nullable(),
  },
  {
    name: 'projects.create',
    description:
      'Create a project owned by one or more teams. teamIds needs at least one team _id. Dates are ISO 8601 strings. Needs projectCreate.',
    kind: 'write',
    field: 'createProject',
    args: {
      name: 'String!',
      description: 'String',
      teamIds: '[String!]!',
      leadId: 'String',
      memberIds: '[String]',
      status: 'Int',
      priority: 'Int',
      startDate: 'Date',
      targetDate: 'Date',
    },
    input: z
      .object({
        name: id,
        description: z.string().optional(),
        teamIds: z.array(id).min(1),
        leadId: id.optional(),
        memberIds: z.array(id).optional(),
        status: z.number().int().optional(),
        priority: z.number().int().optional(),
        startDate: z.string().optional(),
        targetDate: z.string().optional(),
      })
      .strict(),
    output: Project,
  },
  {
    name: 'projects.edit',
    description:
      'Change a project name, description, lead, members, teams, status, priority or dates. Pass only the fields to change. Needs projectUpdate.',
    kind: 'write',
    field: 'updateProject',
    args: {
      _id: 'String!',
      name: 'String',
      description: 'String',
      leadId: 'String',
      memberIds: '[String]',
      teamIds: '[String]',
      status: 'Int',
      priority: 'Int',
      startDate: 'Date',
      targetDate: 'Date',
    },
    input: z
      .object({
        _id: id,
        name: id.optional(),
        description: z.string().optional(),
        leadId: id.optional(),
        memberIds: z.array(id).optional(),
        teamIds: z.array(id).min(1).optional(),
        status: z.number().int().optional(),
        priority: z.number().int().optional(),
        startDate: z.string().optional(),
        targetDate: z.string().optional(),
      })
      .strict(),
    output: Project,
  },
  {
    name: 'projects.remove',
    description:
      'Delete a project by _id. Fails with "Project has tasks" while any task still points at the project, so move or delete those tasks first. Destructive. Needs projectRemove.',
    kind: 'destructive',
    field: 'removeProject',
    args: { _id: 'String!' },
    input: z.object({ _id: id }).strict(),
    output: z.unknown(),
  },
  {
    name: 'teams.list',
    description:
      'List teams. Pass userId for the teams that user is a member of, or projectId for the teams a project belongs to. With neither, returns every team. Read-only. Needs teamRead.',
    kind: 'read',
    field: 'getTeams',
    args: { userId: 'String', projectId: 'String' },
    input: z
      .object({ userId: id.optional(), projectId: id.optional() })
      .strict(),
    output: z.array(Team),
  },
  {
    name: 'teams.get',
    description:
      'Read one team by _id. Returns null when no team has that _id. Read-only. Needs teamRead.',
    kind: 'read',
    field: 'getTeam',
    args: { _id: 'String!' },
    notFound: 'Team not found',
    input: z.object({ _id: id }).strict(),
    output: Team.nullable(),
  },
  {
    name: 'statuses.list',
    description:
      'List statuses of one type for a team. type is 1 started, 2 unstarted, 3 backlog, 4 completed, 5 cancelled or 6 triage. Read-only. Needs statusRead.',
    kind: 'read',
    field: 'getStatusesByType',
    args: { teamId: 'String!', type: 'Int!' },
    input: z.object({ teamId: id, type: statusType }).strict(),
    output: z.array(Status),
  },
  {
    name: 'statuses.get',
    description:
      'Read one status by _id. Returns null when no status has that _id. Read-only. Needs statusRead.',
    kind: 'read',
    field: 'getStatus',
    args: { _id: 'String!' },
    notFound: 'Status not found',
    input: z.object({ _id: id }).strict(),
    output: Status.nullable(),
  },
  {
    name: 'statuses.choices',
    description:
      'List all statuses for a team as label, value, color and type. value is the status _id to pass to tasks.create or tasks.changeStatus. Read-only. Needs statusRead.',
    kind: 'read',
    field: 'getStatusesChoicesByTeam',
    args: { teamId: 'String!' },
    input: z.object({ teamId: id }).strict(),
    output: z.array(StatusChoice),
  },
  {
    name: 'cycles.list',
    description:
      'List cycles for a team, cursor paged. Pass pageInfo.endCursor as cursor to get the next page while hasNextPage is true. Read-only. Needs cycleRead.',
    kind: 'read',
    field: 'getCycles',
    args: { teamId: 'String', limit: 'Int', cursor: 'String' },
    input: z.object({ teamId: id, ...page }).strict(),
    output: listOf(Cycle),
  },
  {
    name: 'cycles.get',
    description:
      'Read one cycle by _id. Returns null when no cycle has that _id. Read-only. Needs cycleRead.',
    kind: 'read',
    field: 'getCycle',
    args: { _id: 'String!' },
    notFound: 'Cycle not found',
    input: z.object({ _id: id }).strict(),
    output: Cycle.nullable(),
  },
  {
    name: 'milestones.list',
    description:
      'List the milestones of a project, cursor paged. searchValue matches part of the name, case-insensitive. Read-only. Needs milestoneRead.',
    kind: 'read',
    field: 'milestones',
    args: {
      projectId: 'String!',
      searchValue: 'String',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({ projectId: id, searchValue: z.string().optional(), ...page })
      .strict(),
    output: listOf(Milestone),
  },
  {
    name: 'milestones.get',
    description:
      'Read one milestone by _id. Returns null when no milestone has that _id. Read-only. Needs milestoneRead.',
    kind: 'read',
    field: 'getMilestone',
    args: { _id: 'String!' },
    notFound: 'Milestone not found',
    input: z.object({ _id: id }).strict(),
    output: Milestone.nullable(),
  },
  {
    name: 'notes.create',
    description:
      'Add a note, which is a comment, to a record. Pass the record _id as contentId; for a task, pass the task _id. Needs noteCreate.',
    kind: 'write',
    field: 'createNote',
    args: { content: 'String', contentId: 'String' },
    input: z.object({ content: id, contentId: id }).strict(),
    output: Note,
  },
]);
