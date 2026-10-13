import { Combobox, Command, Form, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountTypes } from '../hooks/useLoyaltyAccountTypes';
import { LOYALTY_ACCOUNT_TYPE_OWNER_TYPES } from '../types';

const ownerTypeLabel = (ownerType: string) =>
  LOYALTY_ACCOUNT_TYPE_OWNER_TYPES.find(({ value }) => value === ownerType)
    ?.label || ownerType;

// The account type decides whose balance a campaign writes. Only campaigns
// from before account types may stay on the default score.
export const SelectLoyaltyAccountType = ({
  value,
  onValueChange,
  allowDefaultScore = false,
}: {
  value: string;
  onValueChange: (accountTypeId: string) => void;
  allowDefaultScore?: boolean;
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);
  const { accounts, loading } = useLoyaltyAccountTypes();

  // Archived account types are only listed when the campaign already uses them.
  const options = accounts.filter(
    (accountType) =>
      accountType.status === 'active' || accountType._id === value,
  );
  const selected = options.find((accountType) => accountType._id === value);

  const select = (accountTypeId: string) => {
    onValueChange(accountTypeId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          {selected ? (
            <span className="font-medium text-sm">
              {selected.name}
              {selected.status === 'archived' && ` (${t('archived')})`}
            </span>
          ) : (
            <span className="text-accent-foreground/80">
              {value || !allowDefaultScore
                ? t('select-loyalty-account-type')
                : t('loyalty-account-type-none')}
            </span>
          )}
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('type-to-search')} />
          <Command.List>
            {loading ? (
              <div className="flex items-center justify-center h-16 text-muted-foreground text-sm">
                {t('loading')}
              </div>
            ) : (
              <>
                {allowDefaultScore && (
                  <Command.Item value="__none" onSelect={() => select('')}>
                    <span className="text-muted-foreground">
                      {t('loyalty-account-type-none')}
                    </span>
                    <Combobox.Check checked={!value} />
                  </Command.Item>
                )}
                {options.map((accountType) => (
                  <Command.Item
                    key={accountType._id}
                    value={accountType.name}
                    onSelect={() => select(accountType._id)}
                  >
                    <span className="font-medium">{accountType.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {t(ownerTypeLabel(accountType.ownerType))}
                    </span>
                    <Combobox.Check checked={accountType._id === value} />
                  </Command.Item>
                ))}
              </>
            )}
          </Command.List>
          <Command.Empty>{t('no-loyalty-account-types')}</Command.Empty>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
