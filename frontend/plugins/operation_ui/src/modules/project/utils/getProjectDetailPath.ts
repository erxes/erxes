const TEAM_PAGE = /^\/operation\/team\/([^/]+)(?:\/|$)/;

export const getProjectDetailPath = (
  projectId: string,
  pathname: string,
  teamIds?: readonly (string | null)[] | null,
): string => {
  const team = TEAM_PAGE.exec(pathname);
  const parent =
    team && teamIds?.includes(team[1])
      ? `/operation/team/${team[1]}`
      : '/operation';

  return `${parent}/projects/${projectId}/overview`;
};
