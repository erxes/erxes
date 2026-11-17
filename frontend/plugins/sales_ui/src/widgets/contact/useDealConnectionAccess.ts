import { usePermissionCheck, useSidePanel } from 'ui-modules';
import {
  DEAL_CONNECTION_CONTENT_TYPE,
  TDealConnectionContact,
} from './dealContactConnection';

type TDealDefaults = { customerId?: string; companyId?: string };

export const useDealConnectionAccess = () => {
  const { openNewRecord } = useSidePanel();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canCreate = isLoaded && hasActionPermission('dealsAdd');
  const canLink =
    isLoaded &&
    hasActionPermission('showDeals') &&
    hasActionPermission('dealsEdit');

  const addDeal = (
    contact: TDealConnectionContact | null,
    defaults: TDealDefaults,
  ) =>
    contact && canLink
      ? openNewRecord(DEAL_CONNECTION_CONTENT_TYPE, contact, { stack: true })
      : openNewRecord('sales:deal', defaults, { stack: true });

  return {
    isLoaded,
    canCreate,
    canLink,
    canAdd: canCreate || canLink,
    addDeal,
  };
};
