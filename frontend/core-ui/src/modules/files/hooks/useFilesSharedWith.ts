import { IFilesAccessGrant } from 'ui-modules';

type TGroupType = Exclude<IFilesAccessGrant['type'], 'user'>;

const GROUP_ORDER: TGroupType[] = ['everyone', 'department', 'branch', 'unit'];

export const useFilesSharedWith = ({
  sharedWith,
}: {
  sharedWith?: IFilesAccessGrant[] | null;
}) => {
  const grants = sharedWith || [];

  return {
    memberIds: grants.flatMap((grant) =>
      grant.type === 'user' && grant.id ? [grant.id] : [],
    ),
    groups: GROUP_ORDER.map((type) => ({
      type,
      count: grants.filter((grant) => grant.type === type).length,
    })).filter((group) => group.count > 0),
  };
};
