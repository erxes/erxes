import { PageSubHeader } from 'erxes-ui';
import { SubmissionsTotalCount } from './submissions-total-count';
import { SubmissionsFilter } from './submissions-filter';

export const SubmissionsSubHeader = () => {
  return (
    <PageSubHeader>
      <SubmissionsFilter />
      <SubmissionsTotalCount />
    </PageSubHeader>
  );
};
