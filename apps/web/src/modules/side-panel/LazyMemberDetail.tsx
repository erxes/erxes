import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { lazyNamed } from '~/lib/lazyNamed';
import type { IRecordViewProps } from './recordView';

const MemberDetail = lazyNamed(
  () => import('~/modules/settings/team-members/details/MemberDetail'),
  'MemberDetail',
);

/**
 * A team member in the side panel, loaded the first time one opens: the panel is in every
 * page's shell, and a member's view brings the activity timeline with it.
 */
export const LazyMemberDetail = (props: IRecordViewProps) => (
  <Suspense fallback={<Spinner area="lg" />}>
    <MemberDetail {...props} />
  </Suspense>
);
