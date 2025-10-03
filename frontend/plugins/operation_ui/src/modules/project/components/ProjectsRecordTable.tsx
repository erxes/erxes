import { projectsColumns } from '@/project/components/ProjectsColumn';
import { RecordTable, PageSubHeader } from 'erxes-ui';
import { useProjects } from '@/project/hooks/useGetProjects';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { ProjectsFilter } from '@/project/components/ProjectsFilter';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';

export const ProjectsRecordTable = () => {
  const { teamId } = useParams();
  const currentUser = useAtomValue(currentUserState);

  const variables = {
    teamIds: teamId ? [teamId] : undefined,
    userId: currentUser?._id,
  };

  const { projects, handleFetchMore, pageInfo, loading } = useProjects({
    variables,
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { teams } = useGetCurrentUsersTeams();

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <PageSubHeader>
        <ProjectsFilter />
      </PageSubHeader>
      <RecordTable.Provider
        columns={projectsColumns(teams)}
        data={projects || [{}]}
        className="m-3 h-full"
        stickyColumns={['checkbox', 'name']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={projects?.length}
          sessionKey={PROJECTS_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
