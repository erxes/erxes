import * as z from 'zod';
import { defineContract } from '../define';

// Team members, org structure (branches, departments, positions, units),
// the caller's notifications, approval requests and activity logs.

const page = <T extends z.ZodType>(item: T) =>
  z.object({
    list: z.array(item).nullable(),
    totalCount: z.number().nullable(),
    pageInfo: z
      .object({
        hasNextPage: z.boolean().nullable(),
        endCursor: z.string().nullable(),
      })
      .nullable(),
  });

const cursorArgs = { limit: 'Int', cursor: 'String' };
const cursorInput = {
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

const TeamMember = z.object({
  _id: z.string(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  employeeId: z.string().nullable(),
  isActive: z.boolean().nullable(),
  details: z
    .object({
      fullName: z.string().nullable(),
      shortName: z.string().nullable(),
      position: z.string().nullable(),
    })
    .nullable(),
  departmentIds: z.array(z.string()).nullable(),
  branchIds: z.array(z.string()).nullable(),
  positionIds: z.array(z.string()).nullable(),
  unitId: z.string().nullable(),
});

const teamMemberArgs = {
  searchValue: 'String',
  isActive: 'Boolean',
  departmentId: 'String',
  branchId: 'String',
  unitId: 'String',
};
const teamMemberFilters = {
  searchValue: z.string().optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  unitId: z.string().optional(),
};

const Branch = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  order: z.string().nullable(),
  parentId: z.string().nullable(),
  status: z.string().nullable(),
  address: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  userIds: z.array(z.string()).nullable(),
});

const Department = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  order: z.string().nullable(),
  parentId: z.string().nullable(),
  status: z.string().nullable(),
  userIds: z.array(z.string()).nullable(),
});

const Position = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  order: z.string().nullable(),
  parentId: z.string().nullable(),
  status: z.string().nullable(),
  userIds: z.array(z.string()).nullable(),
});

const Unit = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  departmentId: z.string().nullable(),
  userIds: z.array(z.string()).nullable(),
});

const Notification = z.object({
  _id: z.string(),
  title: z.string().nullable(),
  message: z.string().nullable(),
  type: z.string().nullable(),
  priority: z.string().nullable(),
  isRead: z.boolean().nullable(),
  action: z.string().nullable(),
  contentType: z.string().nullable(),
  contentTypeId: z.string().nullable(),
  fromUserId: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const ApprovalDecision = z.object({
  userId: z.string().nullable(),
  decision: z.string().nullable(),
  reason: z.string().nullable(),
  at: z.string().nullable(),
});

const ApprovalRequest = z.object({
  _id: z.string(),
  kind: z.string().nullable(),
  contentType: z.string().nullable(),
  contentId: z.string().nullable(),
  requesterId: z.string().nullable(),
  requiredApproverIds: z.array(z.string()).nullable(),
  reason: z.string().nullable(),
  status: z.string().nullable(),
  decisions: z.array(ApprovalDecision).nullable(),
  createdAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
});

const ActivityLog = z.object({
  _id: z.string(),
  createdAt: z.string().nullable(),
  activityType: z.string().nullable(),
  sourcePlugin: z.string().nullable(),
  actorType: z.string().nullable(),
  targetType: z.string().nullable(),
  action: z.record(z.string(), z.unknown()).nullable(),
  changes: z.record(z.string(), z.unknown()).nullable(),
});

export const coreTeamContract = defineContract('core', 1, [
  {
    name: 'teamMembers.list',
    description:
      'List team members as the calling user sees them, newest first. Returns active members unless isActive is false. searchValue matches email, username, employee ID, name and position. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'users',
    args: { ...teamMemberArgs, ...cursorArgs },
    input: z.object({ ...teamMemberFilters, ...cursorInput }).strict(),
    output: page(TeamMember),
  },
  {
    name: 'teamMembers.count',
    description:
      'Count team members matching the same filters as teamMembers.list. Counts active members unless isActive is false. Read-only.',
    kind: 'read',
    field: 'usersTotalCount',
    args: teamMemberArgs,
    input: z.object(teamMemberFilters).strict(),
    output: z.number(),
  },
  {
    name: 'teamMembers.get',
    description:
      'Read one team member by _id. Returns null when no user has that _id. Read-only.',
    kind: 'read',
    field: 'userDetail',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: TeamMember.nullable(),
  },
  {
    name: 'branches.list',
    description:
      'List branches as the calling user sees them, with cursor paging. searchValue matches title or code. parentId lists the children of one branch. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'branchesMain',
    args: { searchValue: 'String', parentId: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        parentId: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: page(Branch),
  },
  {
    name: 'branches.get',
    description:
      'Read one branch by _id. Returns null when no branch has that _id. Read-only.',
    kind: 'read',
    field: 'branchDetail',
    args: { _id: 'String!' },
    notFound: 'Branch not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Branch.nullable(),
  },
  {
    name: 'branches.create',
    description:
      'Create a branch and return it. code is required and must be unique among branches; it builds the branch order path. parentId nests it under another branch.',
    kind: 'write',
    field: 'branchesAdd',
    args: {
      title: 'String',
      code: 'String',
      parentId: 'String',
      address: 'String',
      email: 'String',
      phoneNumber: 'String',
    },
    input: z
      .object({
        title: z.string().optional(),
        code: z.string().min(1),
        parentId: z.string().optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
      .strict(),
    output: Branch.nullable(),
  },
  {
    name: 'branches.edit',
    description:
      'Update a branch by _id and return it. code is required. Fields you leave out keep their value, except parentId: leaving it out moves the branch to the top level. Children and their order paths are rewritten.',
    kind: 'write',
    field: 'branchesEdit',
    args: {
      _id: 'String!',
      title: 'String',
      code: 'String',
      parentId: 'String',
      address: 'String',
      email: 'String',
      phoneNumber: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        title: z.string().optional(),
        code: z.string().min(1),
        parentId: z.string().optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
      .strict(),
    output: Branch.nullable(),
  },
  {
    name: 'branches.remove',
    description:
      'Remove branches by _id, together with their direct child branches. A branch with user history is marked deleted instead of erased. Destructive.',
    kind: 'destructive',
    field: 'branchesRemove',
    args: { ids: '[String!]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'departments.list',
    description:
      'List departments as the calling user sees them, with cursor paging. searchValue matches title or code. parentId lists the children of one department. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'departmentsMain',
    args: { searchValue: 'String', parentId: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        parentId: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: page(Department),
  },
  {
    name: 'departments.get',
    description:
      'Read one department by _id. Returns null when no department has that _id. Read-only.',
    kind: 'read',
    field: 'departmentDetail',
    args: { _id: 'String!' },
    notFound: 'Department not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Department.nullable(),
  },
  {
    name: 'departments.create',
    description:
      'Create a department and return it. code is required and must be unique among departments; it builds the department order path. parentId nests it under another department.',
    kind: 'write',
    field: 'departmentsAdd',
    args: {
      title: 'String',
      description: 'String',
      code: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        code: z.string().min(1),
        parentId: z.string().optional(),
      })
      .strict(),
    output: Department.nullable(),
  },
  {
    name: 'departments.edit',
    description:
      'Update a department by _id and return it. code is required. Fields you leave out keep their value, except parentId: leaving it out moves the department to the top level. Children and their order paths are rewritten.',
    kind: 'write',
    field: 'departmentsEdit',
    args: {
      _id: 'String!',
      title: 'String',
      description: 'String',
      code: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        title: z.string().optional(),
        description: z.string().optional(),
        code: z.string().min(1),
        parentId: z.string().optional(),
      })
      .strict(),
    output: Department.nullable(),
  },
  {
    name: 'departments.remove',
    description:
      'Remove departments by _id, together with their direct child departments. A department with user history is marked deleted instead of erased. Destructive.',
    kind: 'destructive',
    field: 'departmentsRemove',
    args: { ids: '[String!]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'positions.list',
    description:
      'List positions as the calling user sees them, with cursor paging. searchValue matches title or code. parentId lists the children of one position. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'positionsMain',
    args: { searchValue: 'String', parentId: 'String', ...cursorArgs },
    input: z
      .object({
        searchValue: z.string().optional(),
        parentId: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: page(Position),
  },
  {
    name: 'positions.get',
    description:
      'Read one position by _id. Returns null when no position has that _id. Read-only.',
    kind: 'read',
    field: 'positionDetail',
    args: { _id: 'String' },
    notFound: 'Position not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Position.nullable(),
  },
  {
    name: 'positions.create',
    description:
      'Create a position and return it. code is required and must be unique among positions; it builds the position order path. parentId nests it under another position.',
    kind: 'write',
    field: 'positionsAdd',
    args: { title: 'String', code: 'String', parentId: 'String' },
    input: z
      .object({
        title: z.string().optional(),
        code: z.string().min(1),
        parentId: z.string().optional(),
      })
      .strict(),
    output: Position.nullable(),
  },
  {
    name: 'positions.edit',
    description:
      'Update a position by _id and return it. code is required. Fields you leave out keep their value, except parentId: leaving it out moves the position to the top level. Children and their order paths are rewritten.',
    kind: 'write',
    field: 'positionsEdit',
    args: {
      _id: 'String!',
      title: 'String',
      code: 'String',
      parentId: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        title: z.string().optional(),
        code: z.string().min(1),
        parentId: z.string().optional(),
      })
      .strict(),
    output: Position.nullable(),
  },
  {
    name: 'positions.remove',
    description:
      'Remove positions by _id, together with their direct child positions. A position with user history is marked deleted instead of erased. Destructive.',
    kind: 'destructive',
    field: 'positionsRemove',
    args: { ids: '[String!]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'units.list',
    description:
      'List units with cursor paging. searchValue matches title or description. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'unitsMain',
    args: { searchValue: 'String', ...cursorArgs },
    input: z
      .object({ searchValue: z.string().optional(), ...cursorInput })
      .strict(),
    output: page(Unit),
  },
  {
    name: 'units.get',
    description:
      'Read one unit by _id. Returns null when no unit has that _id. Read-only.',
    kind: 'read',
    field: 'unitDetail',
    args: { _id: 'String!' },
    notFound: 'Unit not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: Unit.nullable(),
  },
  {
    name: 'units.create',
    description:
      'Create a unit and return it. departmentId optionally links it to a department. title and description are optional.',
    kind: 'write',
    field: 'unitsAdd',
    args: { title: 'String', description: 'String', departmentId: 'String' },
    input: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        departmentId: z.string().optional(),
      })
      .strict(),
    output: Unit.nullable(),
  },
  {
    name: 'units.edit',
    description:
      'Update a unit by _id and return it. Fields you leave out keep their value.',
    kind: 'write',
    field: 'unitsEdit',
    args: {
      _id: 'String!',
      title: 'String',
      description: 'String',
      departmentId: 'String',
    },
    input: z
      .object({
        _id: z.string().min(1),
        title: z.string().optional(),
        description: z.string().optional(),
        departmentId: z.string().optional(),
      })
      .strict(),
    output: Unit.nullable(),
  },
  {
    name: 'units.remove',
    description: 'Delete units by _id. Destructive.',
    kind: 'destructive',
    field: 'unitsRemove',
    args: { ids: '[String!]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'notifications.list',
    description:
      "List the calling user's notifications, unread first and newest first. status narrows to READ, UNREAD or ALL. Expired notifications are left out. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.",
    kind: 'read',
    field: 'notifications',
    args: { status: 'NotificationStatus', ...cursorArgs },
    input: z
      .object({
        status: z.enum(['READ', 'UNREAD', 'ALL']).optional(),
        ...cursorInput,
      })
      .strict(),
    output: page(Notification),
  },
  {
    name: 'notifications.unreadCount',
    description:
      "Count the calling user's unread notifications that have not expired. Read-only.",
    kind: 'read',
    field: 'unreadNotificationsCount',
    args: {},
    input: z.object({}).strict(),
    output: z.number(),
  },
  {
    name: 'notifications.markRead',
    description:
      "Mark the calling user's notifications with these ids as read. Ids that belong to other users are not changed. Pass at least one id. Returns { success: true }.",
    kind: 'write',
    field: 'markAsReadNotifications',
    args: { ids: '[String]' },
    input: z.object({ ids: z.array(z.string().min(1)).min(1) }).strict(),
    output: z.unknown(),
  },
  {
    name: 'approvalRequests.list',
    description:
      'List approval requests the calling user made or must approve. Owners see all requests. status is pending, approved, rejected, cancelled, applyFailed or all. contentType and contentId show the requests on one record. Newest first. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'approvalRequests',
    args: {
      status: 'String',
      contentType: 'String',
      contentId: 'String',
      ...cursorArgs,
    },
    input: z
      .object({
        status: z
          .enum([
            'pending',
            'approved',
            'rejected',
            'cancelled',
            'applyFailed',
            'all',
          ])
          .optional(),
        contentType: z.string().min(1).optional(),
        contentId: z.string().min(1).optional(),
        ...cursorInput,
      })
      .strict(),
    output: page(ApprovalRequest),
  },
  {
    name: 'approvalRequests.get',
    description:
      'Read one approval request by _id. Returns null when it does not exist or the calling user cannot see it. Read-only.',
    kind: 'read',
    field: 'approvalRequestDetail',
    args: { _id: 'String!' },
    notFound: 'Approval request not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ApprovalRequest.nullable(),
  },
  {
    name: 'approvalRequests.create',
    description:
      "Ask the approvers of a locked record for access to it. Fails when the record is not locked or the caller already has access. Returns the new request, or the caller's pending request on that lock if one exists.",
    kind: 'write',
    field: 'approvalRequestCreate',
    args: { input: 'ApprovalRequestCreateInput!' },
    input: z
      .object({
        input: z
          .object({
            contentType: z.string().min(1),
            contentId: z.string().min(1),
            reason: z.string().optional(),
          })
          .strict(),
      })
      .strict(),
    output: ApprovalRequest.nullable(),
  },
  {
    name: 'approvalRequests.approve',
    description:
      'Approve a pending request the calling user is a required approver of. An access request lets the requester past the lock. A request that carries a change applies that change once every required approver has approved. Write.',
    kind: 'write',
    field: 'approvalRequestApprove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ApprovalRequest.nullable(),
  },
  {
    name: 'approvalRequests.reject',
    description:
      'Reject a pending request the calling user is a required approver of. The request is resolved as rejected. reason is optional. Write.',
    kind: 'write',
    field: 'approvalRequestReject',
    args: { _id: 'String!', reason: 'String' },
    input: z
      .object({
        _id: z.string().min(1),
        reason: z.string().optional(),
      })
      .strict(),
    output: ApprovalRequest.nullable(),
  },
  {
    name: 'approvalRequests.cancel',
    description:
      'Cancel a pending request. Only the requester can cancel it. Write.',
    kind: 'write',
    field: 'approvalRequestCancel',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ApprovalRequest.nullable(),
  },
  {
    name: 'activityLogs.list',
    description:
      'List the activity log of one record by targetId, newest first. Narrow with targetType, activityType, or dateFrom and dateTo as ISO dates. Pass pageInfo.endCursor as cursor while pageInfo.hasNextPage is true. limit is 1 to 50. Read-only.',
    kind: 'read',
    field: 'activityLogs',
    args: {
      targetId: 'String!',
      targetType: 'String',
      activityType: 'String',
      dateFrom: 'Date',
      dateTo: 'Date',
      ...cursorArgs,
    },
    input: z
      .object({
        targetId: z.string().min(1),
        targetType: z.string().optional(),
        activityType: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        ...cursorInput,
      })
      .strict(),
    output: page(ActivityLog),
  },
]);
