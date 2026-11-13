const PROJECT_PAGE = /^\/operation\/((?:team\/[^/]+\/)?projects\/[^/]+)/;
const TEAM_PAGE = /^\/operation\/(team\/[^/]+)/;

/**
 * A task's page under where it was opened from: a project's, a team's, or
 * My Tasks from anywhere else.
 */
export const getTaskDetailPath = (taskId: string, pathname: string) => {
  const parent = PROJECT_PAGE.exec(pathname) ?? TEAM_PAGE.exec(pathname);

  return parent
    ? `/operation/${parent[1]}/tasks/${taskId}`
    : `/operation/tasks/${taskId}`;
};
