import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
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
  executionDetail,
}: {
  executionDetail: IAutomationHistory;
}) => {
  const { triggerType, target } = executionDetail;
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
    const collection =
      collectionType || CORE_TRIGGER_COLLECTIONS[triggerType] || '';
    const { getName, getLink } =
      coreHistoryName[collection as keyof typeof coreHistoryName] || {};
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

/**
 * Trigger types that name no collection of their own.
 *
 * A campaign's trigger says where the run came from, not what it ran against —
 * it is `core:broadcast` because broadcast owns it. What it enrolls is always
 * a customer, so its runs are named the way a customer is.
 */
const CORE_TRIGGER_COLLECTIONS: Record<string, string> = {
  'core:broadcast': 'customers',
};

const coreHistoryName = {
  customers: {
    getLink: (target: ICustomer) =>
      `/contacts/customers?contactId=${target._id}`,
    getName: (target: ICustomer) =>
      [target?.firstName, target?.lastName].filter(Boolean).join(' ') ||
      target.primaryEmail,
  },
  companies: {
    getLink: (target: ICompany) =>
      `/contacts/companies?companyId=${target._id}`,
    getName: (target: ICompany) => target.names?.[0] || target.primaryName,
  },
  users: {
    getLink: (target: IUser) => `/settings/team-member?user_id=${target._id}`,
    getName: (target: IUser) => target.email,
  },
};
