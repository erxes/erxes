import { CMS_POST_ACTIONS, permissions } from '~/meta/permissions';
import { requireCmsPermission } from '../../utils/permissions';

jest.mock('erxes-api-shared/core-modules', () => ({
  canGroup: jest.fn(),
  getGroupActionsMap: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

function contextFor(groupId: string) {
  return {
    subdomain: 'tenantA',
    user: { _id: 'memberA', isActive: true, permissionGroupIds: [groupId] },
    models: {},
  } as unknown as Parameters<typeof requireCmsPermission>[0];
}

test.each([
  'content:cms-journalist-1',
  'content:cms-journalist-2',
  'content:cms-editor',
  'content:cms-admin',
])('%s grants sharing through the existing default role', async (id) => {
  const group = permissions.defaultGroups?.find((entry) => entry.id === id);
  const cms = group?.permissions.find((entry) => entry.module === 'cmsPost');
  expect(
    cms?.actions?.filter((action) => action === CMS_POST_ACTIONS.sharePostiz),
  ).toHaveLength(1);
  expect(cms?.scope).toBe('all');
  await expect(
    requireCmsPermission(contextFor(id), CMS_POST_ACTIONS.sharePostiz),
  ).resolves.toBe('all');
});

test('Journalist 2 retains review-only publication access despite the sharing grant', async () => {
  const context = contextFor('content:cms-journalist-2');
  await expect(
    requireCmsPermission(context, CMS_POST_ACTIONS.createReview),
  ).resolves.toBe('all');
  await expect(
    requireCmsPermission(context, [
      CMS_POST_ACTIONS.approve,
      CMS_POST_ACTIONS.createPublished,
    ]),
  ).rejects.toThrow('Permission required');
  await expect(
    requireCmsPermission(context, CMS_POST_ACTIONS.managePermissions),
  ).rejects.toThrow('Permission required');
});

test.each([
  'content:cms-journalist-1',
  'content:cms-editor',
  'content:cms-admin',
])('%s keeps its existing publication grant', async (id) => {
  await expect(
    requireCmsPermission(contextFor(id), [
      CMS_POST_ACTIONS.approve,
      CMS_POST_ACTIONS.createPublished,
    ]),
  ).resolves.toBe('all');
});

test.each(['content:viewer', 'content:unknown'])(
  '%s receives no sharing permission',
  async (id) => {
    await expect(
      requireCmsPermission(contextFor(id), CMS_POST_ACTIONS.sharePostiz),
    ).rejects.toThrow('Permission required');
  },
);
