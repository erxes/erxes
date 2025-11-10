import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { CellContext } from '@tanstack/table-core';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import {
  IAutomationHistory,
  ICompany,
  ICustomer,
  IUser,
  splitAutomationNodeType,
} from 'ui-modules';

export const AutomationHistoryResultName = ({
  cell,
}: CellContext<IAutomationHistory, unknown>) => {
  const { triggerType, target } = cell.row.original;
  const [pluginName, moduleName, collectionType] =
    splitAutomationNodeType(triggerType);

  if (pluginName !== 'core' && moduleName) {
    return (
      <RenderPluginsComponentWrapper
        pluginName={pluginName}
        moduleName={moduleName}
        props={{
          componentType: 'historyName',
          triggerType,
          target,
        }}
      />
    );
  }

  if (pluginName === 'core') {
    const { getName, getLink } =
      coreHistoryName[collectionType as keyof typeof coreHistoryName] || {};
    const name = getName?.(target);
    const link = getLink?.(target);
    return (
      <Button asChild variant="link">
        <Link target="_blank" to={link || '#'}>
          {name || 'Empty'}
        </Link>
      </Button>
    );
  }

  return 'Empty';
};

const coreHistoryName = {
  customer: {
    getLink: (target: ICustomer) =>
      `/contacts/customers?contactId=${target._id}`,
    getName: (target: ICustomer) =>
      `${target?.firstName || ''}${target?.lastName || ''}` ||
      target.primaryEmail,
  },
  company: {
    getLink: (target: ICompany) =>
      `/contacts/companies?companyId=${target._id}`,
    getName: (target: ICompany) => target.names?.[0] || target.primaryName,
  },
  user: {
    getLink: (target: IUser) => `/settings/team-member?user_id=${target._id}`,
    getName: (target: IUser) => target.email,
  },
};
