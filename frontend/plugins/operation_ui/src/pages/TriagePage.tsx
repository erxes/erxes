import { PageContainer } from 'erxes-ui';
import { Navigate, useParams } from 'react-router-dom';
import { getRecordPanelListUrl } from 'ui-modules';
import { Triages } from '@/triage/components/TriageList';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { TaskDetailLink } from '@/task/components/TaskDetailLink';

export const TriagePage = () => {
  return (
    <PageContainer>
      <TaskDetailLink />
      <div className="flex flex-1 overflow-hidden">
        <Triages />
      </div>
    </PageContainer>
  );
};

export const TriageDetailRedirect = () => {
  const { teamId, triageId } = useParams<{
    teamId: string;
    triageId: string;
  }>();
  const listPath = `/operation/team/${teamId}/triage`;

  return (
    <Navigate
      replace
      to={
        triageId
          ? getRecordPanelListUrl(listPath, {
              contentType: TRIAGE_CONTENT_TYPE,
              contentId: triageId,
            })
          : listPath
      }
    />
  );
};
