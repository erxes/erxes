import { projectsColumns } from '@/project/components/ProjectsColumn';
import { RecordTable, PageSubHeader } from 'erxes-ui';
import { useProjects, useProjectsVariables } from '@/project/hooks/useGetProjects';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { ProjectsFilter } from '@/project/components/ProjectsFilter';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { Can, currentUserState, Export } from 'ui-modules';
import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import { ProjectsCommandBar } from './projects-command-bar/ProjectsCommandBar';

/** Renders the export button for the projects list, wired up to the current filter state. */
const ProjectsExportButton = () => {
  const { teamId } = useParams();
  const currentUser = useAtomValue(currentUserState);

  const variables = useProjectsVariables({
    teamIds: teamId ? [teamId] : undefined,
    memberId: teamId ? undefined : currentUser?._id,
  });

  /** Returns the active filter values from the current projects query variables. */
  const getFilters = () => {
    const { name, priority, status, leadId, tagIds, teamIds, memberId } =
      variables;

    return {
      ...(name && { name }),
      ...(priority !== undefined && priority !== null && { priority }),
      ...(status !== undefined && status !== null && { status }),
      ...(leadId && { leadId }),
      ...(tagIds?.length && { tagIds }),
      ...(teamIds?.length && { teamIds }),
      ...(memberId && { memberId }),
    };
  };

  return (
    <Can action="exportsManage">
      <Export
        pluginName="operation"
        moduleName="project"
        collectionName="project"
        getFilters={getFilters}
        buttonVariant="outline"
      />
    </Can>
  );
};

export const ProjectsRecordTable = () => {
  const { teamId } = useParams();
  const currentUser = useAtomValue(currentUserState);

  const variables = {
    teamIds: teamId ? [teamId] : undefined,
    memberId: teamId ? undefined : currentUser?._id,
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
        <ProjectsExportButton />
      </PageSubHeader>
      <RecordTable.Provider
        columns={projectsColumns(teams)}
        data={projects || [{}]}
        className="m-3 h-full"
        stickyColumns={['more', 'checkbox', 'name']}
        tableId="projects_record_table"
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
        <ProjectsCommandBar />
      </RecordTable.Provider>
    </div>
  );
};
