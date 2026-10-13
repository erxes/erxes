import { IconWallet } from '@tabler/icons-react';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountTypes } from '../hooks/useLoyaltyAccountTypes';
import { LoyaltyAccountTypeFormSheet } from './LoyaltyAccountTypeFormSheet';
import { loyaltyAccountTypeColumns } from './loyaltyAccountTypeColumns';

export const LoyaltyAccountTypeTable = () => {
  const { t } = useTranslation('loyalty');
  const { accounts, loading } = useLoyaltyAccountTypes();
  const [editAccountId, setEditAccountId] = useQueryState<string>(
    'editLoyaltyAccountTypeId',
  );
  const editingAccount = accounts.find(({ _id }) => _id === editAccountId);

  return (
    <RecordTable.Provider
      columns={loyaltyAccountTypeColumns(t)}
      data={accounts}
      className="m-3"
      stickyColumns={['more', 'name']}
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={10} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
      {!loading && accounts.length === 0 && (
        <div className="h-full w-full px-8 flex justify-center">
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <IconWallet
              size={64}
              className="text-muted-foreground mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">
              {t('no-loyalty-account-types')}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t('loyalty-account-type-description')}
            </p>
          </div>
        </div>
      )}
      <LoyaltyAccountTypeFormSheet
        accountType={editingAccount}
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditAccountId(null)}
      />
    </RecordTable.Provider>
  );
};
