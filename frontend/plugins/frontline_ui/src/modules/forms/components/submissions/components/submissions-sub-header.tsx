import { PageSubHeader } from 'erxes-ui';
import { Export } from 'ui-modules';
import { useParams } from 'react-router';
import { SubmissionsTotalCount } from './submissions-total-count';
import { SubmissionsFilter } from './submissions-filter';

export const SubmissionsSubHeader = () => {
  const { formId } = useParams<{ formId: string }>();

  return (
    <PageSubHeader>
      <SubmissionsFilter />
      <div className="flex items-center gap-2">
        <SubmissionsTotalCount />
      </div>
      <div className="flex-none ml-auto">
        <Export
          pluginName="frontline"
          moduleName="formSubmission"
          collectionName="formSubmission"
          buttonVariant="secondary"
          getFilters={() => (formId ? { formId } : {})}
        />
      </div>
    </PageSubHeader>
  );
};
