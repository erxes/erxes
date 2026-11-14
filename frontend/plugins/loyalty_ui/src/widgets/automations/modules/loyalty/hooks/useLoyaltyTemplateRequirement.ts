import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
} from 'ui-modules';
import { ILoyaltyAccountType } from '~/modules/loyalties/settings/account-type/types';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';

const ACCOUNT_TYPE_REQUIREMENT = 'accountType';

const asAccountTypeId = (value: unknown) =>
  typeof value === 'string' ? value : '';

const accountTypeName = (accounts: ILoyaltyAccountType[], id: string) =>
  accounts.find(({ _id }) => _id === id)?.name || null;

/**
 * A wallet (account type) answered for a template: the id goes to the
 * wizard, the name to the collapsed step. The picker reads its field from a
 * form, so it gets one of its own.
 */
export const useLoyaltyTemplateRequirement = ({
  kind,
  value,
  onChange,
  onLabel,
}: Pick<
  AutomationTemplateRequirementProps,
  'kind' | 'value' | 'onChange' | 'onLabel'
>) => {
  // `loyalty:score.<what>`
  const [, , what] = splitAutomationNodeType(kind);
  const accountTypeId = asAccountTypeId(value);
  const { accounts } = useLoyaltyAccountTypes();
  const form = useForm<{ accountTypeId: string }>({
    values: { accountTypeId },
  });

  // Named once the list arrives, also for an answer given before
  useEffect(() => {
    onLabel?.(accountTypeName(accounts, accountTypeId));
  }, [accounts, accountTypeId, onLabel]);

  const select = useCallback(
    (next: string) => {
      form.setValue('accountTypeId', next);
      onChange(next || null);
    },
    [form, onChange],
  );

  return {
    isAccountType: what === ACCOUNT_TYPE_REQUIREMENT,
    form,
    select,
  };
};
