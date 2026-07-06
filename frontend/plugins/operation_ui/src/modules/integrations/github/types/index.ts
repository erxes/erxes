export interface GithubIssuesSectionProps {
  installationId: number;
  orgName: string;
}

export interface ITeam {
  _id: string;
  name: string;
}

export interface LinkRepoDialogProps {
  open: boolean;
  onClose: () => void;
  installationId: number;
  orgName: string;
  onSaved: () => void;
  linkedRepos: string[];
}