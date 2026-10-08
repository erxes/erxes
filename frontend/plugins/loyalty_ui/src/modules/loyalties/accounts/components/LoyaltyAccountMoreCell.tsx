import {
  IconExternalLink,
  IconHistory,
  IconSnowflake,
  IconSnowflakeOff,
} from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountPermissions } from '../hooks/useLoyaltyAccountPermissions';
import { useLoyaltyAccountRowActions } from '../hooks/useLoyaltyAccountRowActions';
import { ILoyaltyAccount } from '../types';
import { FreezeAccountDialog } from './FreezeAccountDialog';

export const LoyaltyAccountMoreCell = ({
  account,
}: {
  account: ILoyaltyAccount;
}) => {
  const { t } = useTranslation('loyalty');
  const {
    menuOpen,
    setMenuOpen,
    freezeOpen,
    setFreezeOpen,
    loading,
    isFrozen,
    hasOwner,
    toggleFreeze,
    openScoreHistory,
    openProfile,
  } = useLoyaltyAccountRowActions(account);
  const { canFreeze } = useLoyaltyAccountPermissions();

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              {canFreeze && (
                <Command.Item
                  value="freeze"
                  onSelect={toggleFreeze}
                  disabled={loading}
                >
                  {isFrozen ? (
                    <IconSnowflakeOff size={14} />
                  ) : (
                    <IconSnowflake size={14} />
                  )}
                  {isFrozen
                    ? t('loyalty-account-unfreeze')
                    : t('loyalty-account-freeze')}
                </Command.Item>
              )}
              <Command.Item
                value="score-history"
                onSelect={openScoreHistory}
                disabled={!hasOwner}
              >
                <IconHistory size={14} />
                {t('loyalty-account-score-history')}
              </Command.Item>
              <Command.Item
                value="see-profile"
                onSelect={openProfile}
                disabled={!hasOwner}
              >
                <IconExternalLink size={14} />
                {t('see-profile')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <FreezeAccountDialog
        accountId={account._id}
        open={freezeOpen}
        onOpenChange={setFreezeOpen}
      />
    </>
  );
};
