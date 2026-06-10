import { splitAutomationNodeType } from 'ui-modules';

const checkAction = (
  type: string,
  module: string,
  collection: string,
  action: string,
) => {
  const [, moduleName, _collectionName, actionType] =
    splitAutomationNodeType(type);

  return (
    moduleName === module &&
    actionType === action &&
    (_collectionName === collection || !collection)
  );
};

export const isAdjustScoreActionType = (type?: string) => {
  return checkAction(type || '', 'score', 'score', 'create');
};

export const isIssueVoucherActionType = (type?: string) => {
  return checkAction(type || '', 'voucher', 'voucher', 'create');
};

export const isAwardSpinActionType = (type?: string) => {
  return checkAction(type || '', 'spin', 'spin', 'create');
};

export const isAwardVoucherActionType = isAwardSpinActionType;
