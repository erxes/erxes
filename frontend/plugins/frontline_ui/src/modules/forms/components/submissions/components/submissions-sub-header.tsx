import { PageSubHeader } from 'erxes-ui';
import { Can, Export } from 'ui-modules';
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
        <Can action="formSubmissionsExportManage">
          <Export
            pluginName="frontline"
            moduleName="formSubmission"
            collectionName="formSubmission"
            buttonVariant="secondary"
            getFilters={() => (formId ? { formId } : {})}
          />
        </Can>
      </div>
    </PageSubHeader>
  );
};
