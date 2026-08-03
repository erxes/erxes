import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconBuildingBank, IconPlus } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Collapsible,
  REACT_APP_API_URL,
  RecordTable,
  Sheet,
} from 'erxes-ui';
import { PAYMENT_KINDS } from '~/modules/payment/constants';
import { PaymentKind } from '~/modules/payment/types/PaymentMethods';
import { useKhanbankConfigs } from './useKhanbankConfigs';
import { khanbankColumns } from './KhanbankColumns';
import { KhanbankConfigForm } from './KhanbankConfigForm';
import { IKhanbankConfigsItem } from '../configs/types';
import { GatewaySelectionSync } from '~/modules/corporateGateway/components/GatewaySelectionSync';

const KHANBANK_PAYMENT = PAYMENT_KINDS[PaymentKind.KHANBANK];

type RowProps = React.ComponentProps<typeof RecordTable.Row> & {
  original?: IKhanbankConfigsItem;
  addConfig: (variables: Record<string, any>) => Promise<any>;
  editConfig: (variables: Record<string, any>) => Promise<any>;
};

const KhanbankRow = ({
  addConfig,
  editConfig,
  original,
  ...props
}: RowProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <RecordTable.Row
        {...props}
        original={original}
        className="cursor-pointer"
        onClick={() => setEditOpen(true)}
      />
      <Sheet open={editOpen} onOpenChange={setEditOpen} modal>
        <Sheet.View className="p-0 sm:max-w-lg">
          <KhanbankConfigForm
            config={original}
            addConfig={addConfig}
            editConfig={editConfig}
            onCancel={() => setEditOpen(false)}
          />
        </Sheet.View>
      </Sheet>
    </>
  );
};

export const KhanbankSection = ({ searchValue }: { searchValue: string }) => {
  const { t } = useTranslation('payment');
  const [addOpen, setAddOpen] = useState(false);
  const { configs, totalCount, loading, addConfig, editConfig, removeConfig } =
    useKhanbankConfigs();

  const filteredConfigs = configs.filter((config) =>
    (config.name || '')
      .toLowerCase()
      .includes(searchValue.trim().toLowerCase()),
  );

  const CustomRow = useCallback(
    (props: any) => (
      <KhanbankRow {...props} addConfig={addConfig} editConfig={editConfig} />
    ),
    [addConfig, editConfig],
  );

  return (
    <div className="rounded-md border bg-background">
      <Collapsible defaultOpen>
        <Collapsible.Trigger asChild>
          <div className="group flex items-center justify-between border-b pr-3 h-14 rounded-t-md cursor-pointer hover:bg-accent-foreground/10 transition-colors">
            <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
              <Collapsible.TriggerIcon className="size-3.5" />
              <img
                src={`${REACT_APP_API_URL}/pl:payment/static/images/payments/khanbank.png`}
                alt={KHANBANK_PAYMENT.name}
                className="h-6 w-6 rounded-md object-contain"
              />
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">
                  {KHANBANK_PAYMENT.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalCount > 0 ? t('connected') : t('not-connected')}
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge variant="secondary">{totalCount}</Badge>
              <Sheet open={addOpen} onOpenChange={setAddOpen}>
                <Sheet.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <IconPlus className="w-4 h-4" />
                    {t('add-config')}
                  </Button>
                </Sheet.Trigger>
                <Sheet.View className="p-0 sm:max-w-lg">
                  <KhanbankConfigForm
                    addConfig={addConfig}
                    editConfig={editConfig}
                    onCancel={() => setAddOpen(false)}
                  />
                </Sheet.View>
              </Sheet>
            </div>
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <RecordTable.Provider
            data={filteredConfigs}
            columns={khanbankColumns({ addConfig, editConfig, removeConfig })}
            tableId="corporate-gateway-khanbank-v2"
            stickyColumns={['more', 'checkbox', 'name']}
          >
            {loading || filteredConfigs.length > 0 ? (
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {loading && <RecordTable.RowSkeleton rows={3} />}
                  <RecordTable.RowList Row={CustomRow} />
                </RecordTable.Body>
              </RecordTable>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="mb-1">
                  <IconBuildingBank
                    size={24}
                    className="text-muted-foreground"
                  />
                </div>
                <h3 className="text-sm font-semibold">{t('no-configs')}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('no-configs-description')}
                </p>
              </div>
            )}
            <GatewaySelectionSync
              bankKey="khanbank"
              removeConfig={removeConfig}
            />
          </RecordTable.Provider>
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
};

export default KhanbankSection;
