import { CustomersDelete } from '@/contacts/customers/components/customers-command-bar/delete/CustomersDelete';
import { CustomersMerge } from '@/contacts/customers/components/customers-command-bar/merge/CustomersMerge';
import { CustomersChangeState } from '@/contacts/customers/components/customers-command-bar/CustomersChangeState';
import { BROADCAST_SELECTABLE_METHODS } from '@/broadcast/constants';
import { useBroadcastContacts } from '@/broadcast/hooks/useBroadcastContacts';
import { ApolloError } from '@apollo/client';
import {
  IconArrowLeft,
  IconDownload,
  IconRepeat,
  IconSend,
} from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import {
  Button,
  Command,
  CommandBar,
  Label,
  Popover,
  RecordTable,
  Separator,
  cn,
  toast,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActiveExports,
  Can,
  ExportFieldSelection,
  ICustomer,
  TagsSelect,
  useExport,
} from 'ui-modules';

export const CustomersCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<
    'main' | 'broadcast' | 'export'
  >('main');
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: tBroadcast } = useTranslation('broadcasts');
  const { t: tExport } = useTranslation('importExport');
  const { setContacts } = useBroadcastContacts();
  const setQueryStateByKey = useSetQueryStateByKey();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const customerIds = selectedRows.map(
    (row: Row<ICustomer>) => row.original._id,
  );
  const entityType = 'core:contacts.customers';
  const { loading: exportLoading, onFieldSelectionConfirm } = useExport({
    entityType,
    ids: customerIds,
    confirmMessage: tExport('export-confirm'),
  });
  const intersection = (arrays: string[][]): string[] => {
    if (arrays.length === 0) return [];
    return arrays.reduce((common, current) =>
      common.filter((item) => current.includes(item)),
    );
  };

  const closeActions = () => {
    setOpen(false);
    setCurrentContent('main');
  };
  const openExportFields = () => {
    closeActions();
    setFieldSelectionOpen(true);
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Can action="tagsTag">
          <>
            <Separator.Inline />
            <TagsSelect
              type="core:customer"
              mode="multiple"
              variant="secondary"
              className="shadow-none"
              value={intersection(
                selectedRows.map((row) => row.original.tagIds ?? []),
              )}
              targetIds={customerIds}
              options={(newSelectedTagIds) => ({
                update: (cache) => {
                  customerIds.forEach((customerId) => {
                    cache.modify({
                      id: cache.identify({
                        __typename: 'Customer',
                        _id: customerId,
                      }),
                      fields: {
                        tagIds: () => newSelectedTagIds,
                      },
                    });
                  });
                },
                onError: (e: ApolloError) => {
                  toast({
                    title: 'Error',
                    description: e.message,
                    variant: 'destructive',
                  });
                },
              })}
            />
          </>
        </Can>
        <Can action="contactsUpdate">
          <>
            <Separator.Inline />
            <CustomersChangeState
              customerIds={customerIds}
              rows={selectedRows}
            />
          </>
        </Can>
        <Can action="contactsMerge">
          <>
            <Separator.Inline />
            <CustomersMerge
              customers={selectedRows.map((row) => row.original)}
              disabled={selectedRows.length !== 2}
              rows={selectedRows}
            />
          </>
        </Can>
        <Can
          actions={[
            'broadcastCreate',
            'customersExportManage',
            'contactsDelete',
          ]}
        >
          <Separator.Inline />
          <Popover
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen);
              if (!nextOpen) {
                setCurrentContent('main');
              }
            }}
          >
            <Popover.Trigger asChild>
              <Button variant="secondary">
                <IconRepeat />
                {t('actions')}
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className={cn(
                'p-0',
                currentContent === 'export' ? 'w-[460px]' : 'min-w-[280px]',
              )}
              align="end"
              side="top"
              sideOffset={10}
            >
              {currentContent === 'main' && (
                <Command>
                  <Command.List className="p-0">
                    <Command.Group className="p-1">
                      <Can action="broadcastCreate">
                        <Command.ActionItem
                          icon={IconSend}
                          label={tBroadcast('actions.send-broadcast')}
                          onSelect={() => setCurrentContent('broadcast')}
                        />
                      </Can>
                      <Can action="customersExportManage">
                        <Command.ActionItem
                          icon={IconDownload}
                          label={tExport('export')}
                          disabled={exportLoading}
                          onSelect={() => setCurrentContent('export')}
                        />
                      </Can>
                    </Command.Group>
                    <Can action="contactsDelete">
                      <Command.Separator />
                      <Command.Group className="p-1">
                        <CustomersDelete
                          customerIds={customerIds}
                          onCompleted={closeActions}
                        />
                      </Command.Group>
                    </Can>
                  </Command.List>
                </Command>
              )}
              {currentContent === 'broadcast' && (
                <Can action="broadcastCreate">
                  <Command>
                    <Command.List className="p-0">
                      <Command.Group className="p-1">
                        <Command.Item
                          onSelect={() => setCurrentContent('main')}
                        >
                          <IconArrowLeft />
                          {tBroadcast('actions.send-broadcast')}
                        </Command.Item>
                      </Command.Group>
                      <Command.Separator />
                      <Command.Group className="p-1">
                        {BROADCAST_SELECTABLE_METHODS.map(
                          ({ value, labelKey, descriptionKey }) => (
                            <Command.Item
                              key={value}
                              value={value}
                              className="h-auto items-start"
                              onSelect={() => {
                                setContacts(customerIds);
                                closeActions();
                                setQueryStateByKey('method', value);
                              }}
                            >
                              <div className="flex flex-col gap-1 p-2">
                                <Label variant="peer">
                                  {tBroadcast(labelKey)}
                                </Label>
                                <div className="text-xs text-accent-foreground">
                                  {tBroadcast(descriptionKey)}
                                </div>
                              </div>
                            </Command.Item>
                          ),
                        )}
                      </Command.Group>
                    </Command.List>
                  </Command>
                </Can>
              )}
              {currentContent === 'export' && (
                <Can action="customersExportManage">
                  <Command>
                    <Command.List className="p-0">
                      <Command.Group className="p-1">
                        <Command.Item
                          onSelect={() => setCurrentContent('main')}
                        >
                          <IconArrowLeft />
                          {tExport('export')}
                        </Command.Item>
                      </Command.Group>
                      <Command.Separator />
                    </Command.List>
                  </Command>
                  <div className="p-5">
                    <ActiveExports
                      entityType={entityType}
                      entityDisplayName={tExport('entity-customers')}
                      selectionCount={customerIds.length}
                      onStartExport={openExportFields}
                    />
                  </div>
                </Can>
              )}
            </Popover.Content>
          </Popover>
        </Can>
      </CommandBar.Bar>
      <Can action="customersExportManage">
        <ExportFieldSelection
          entityType={entityType}
          open={fieldSelectionOpen}
          onOpenChange={setFieldSelectionOpen}
          onConfirm={onFieldSelectionConfirm}
          recordCount={customerIds.length}
        />
      </Can>
    </CommandBar>
  );
};
