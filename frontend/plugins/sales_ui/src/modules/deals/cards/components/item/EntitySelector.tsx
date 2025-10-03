import {
  Icon,
  IconBuilding,
  IconCirclesRelation,
  IconFlag,
  IconGitBranch,
  IconTag,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';

import { Button } from 'erxes-ui';
import { IDeal } from '@/deals/types/deals';

type Props = {
  card: IDeal;
};

type EntityItemProps = {
  Icon: Icon;
  text: string;
  totalCount: number;
};

export const EntityItem = ({ Icon, text, totalCount }: EntityItemProps) => {
  return (
    <Button size="sm" variant="secondary">
      <Icon />
      {text}
      <span className="text-gray-400">{totalCount}</span>
    </Button>
  );
};

export const EntitySelector = ({ card = {} as IDeal }: Props) => {
  const {
    priority,
    tags = [],
    companies,
    customers,
    relations,
    departments = [],
    branches = [],
  } = card;

  return (
    <div className="flex flex-wrap gap-1">
      {(branches || []).length > 0 && (
        <EntityItem
          Icon={IconGitBranch}
          text="Branch"
          totalCount={branches?.length || 0}
        />
      )}
      {companies && (
        <EntityItem
          Icon={IconBuilding}
          text="Company"
          totalCount={companies?.length || 0}
        />
      )}
      {customers && (
        <EntityItem
          Icon={IconUser}
          text="Customer"
          totalCount={customers?.length || 0}
        />
      )}
      {(departments || []).length > 0 && (
        <EntityItem
          Icon={IconUsers}
          text="Department"
          totalCount={departments?.length || 0}
        />
      )}
      {priority && (
        <EntityItem Icon={IconFlag} text="Priority" totalCount={0} />
      )}
      {relations && (
        <EntityItem
          Icon={IconCirclesRelation}
          text="Relation"
          totalCount={relations?.length || 0}
        />
      )}
      {(tags || []).length > 0 && (
        <EntityItem Icon={IconTag} text="Tag" totalCount={tags?.length || 0} />
      )}
    </div>
  );
};
