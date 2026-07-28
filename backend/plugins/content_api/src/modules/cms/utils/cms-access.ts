import { IContext } from '~/connectionResolvers';
import { IContentCMSDocument } from '@/cms/@types/cms';

/**
 * Per-CMS team-member access control.
 *
 * Each CMS has an `accessPolicy`:
 *   - 'open'     => any logged-in team member with content access can use it
 *                  (this is the default, so existing CMSs keep working).
 *   - 'assigned' => only the team members listed in `assignedMemberIds`,
 *                  plus owners, can use it.
 *
 * Owners (`user.isOwner`) always bypass the policy.
 */

type CmsAccessDoc = Pick<
  IContentCMSDocument,
  'accessPolicy' | 'assignedMemberIds'
>;

export const canAccessCmsDoc = (
  context: IContext,
  cms?: CmsAccessDoc | null,
): boolean => {
  const { user } = context;

  if (!user?._id) {
    return false;
  }

  if (user.isOwner) {
    return true;
  }

  // Unknown / not-yet-configured CMS is treated as open.
  if (!cms || cms.accessPolicy !== 'assigned') {
    return true;
  }

  return (cms.assignedMemberIds || []).includes(user._id);
};

export const assertCmsDocAccess = (
  context: IContext,
  cms?: CmsAccessDoc | null,
): void => {
  if (!context.user?._id) {
    throw new Error('Login required');
  }

  if (!canAccessCmsDoc(context, cms)) {
    throw new Error('You do not have access to this CMS');
  }
};

/**
 * Resolve a CMS by its clientPortalId and assert access. Results are cached on
 * the request context so repeated checks within one request stay cheap.
 */
export const assertCmsAccessByClientPortal = async (
  context: IContext,
  clientPortalId?: string,
): Promise<void> => {
  if (!context.user?._id) {
    throw new Error('Login required');
  }

  if (context.user.isOwner) {
    return;
  }

  if (!clientPortalId) {
    // Nothing to scope against; fall back to the generic logged-in check.
    return;
  }

  const cache: Record<string, CmsAccessDoc | null> =
    (context as any).__cmsAccessByClientPortal ||
    ((context as any).__cmsAccessByClientPortal = {});

  let cms = cache[clientPortalId];

  if (cms === undefined) {
    cms = await context.models.CMS.findOne({ clientPortalId })
      .select({ accessPolicy: 1, assignedMemberIds: 1 })
      .lean();
    cache[clientPortalId] = cms;
  }

  assertCmsDocAccess(context, cms);
};
