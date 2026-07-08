import {
  IconChessKnight,
  IconShoppingCart,
  IconTag,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import dayjs from 'dayjs';
import {
  Form,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { usePosCoversQuery } from '../detail/hook/usePosCoversQuery';

interface ICoverItemRow {
  paidType: string;
  kind: string;
  kindOfVal: string;
  value: string;
  amount: number;
}

const itemColumns: ColumnDef<ICoverItemRow>[] = [
  {
    id: 'paidType',
    accessorKey: 'paidType',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconShoppingCart} label={t('type')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconTag} label={t('kind')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'kindOfVal',
    accessorKey: 'kindOfVal',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconTag} label={t('kind-of-val')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconTag} label={t('value')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconTag} label={t('amount')} />;
    },
    cell: ({ cell }) => {
      const val = cell.getValue() as number | undefined;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={val != null ? val.toLocaleString() : '0'}
          />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
];

export const PosCoversSheet = () => {
  const [posCoverId, setPosCoverId] = React.useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    const coverId = searchParams.get('pos_cover_id');
    if (coverId !== posCoverId) {
      setPosCoverId(coverId || '');
    }
  }, [searchParams, posCoverId]);

  const updatePosCoverId = React.useCallback(
    (coverId: string) => {
      setPosCoverId(coverId);
      if (coverId) {
        searchParams.set('pos_cover_id', coverId);
      } else {
        searchParams.delete('pos_cover_id');
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const { posCovers } = usePosCoversQuery(posCoverId || undefined);
  const { t } = useTranslation('sales');

  const form = useForm<{ note?: string }>({
    defaultValues: {
      note: '',
    },
  });

  return (
    <Sheet
      open={!!posCoverId}
      onOpenChange={(isOpen) => {
        if (!isOpen) updatePosCoverId('');
      }}
    >
      <Sheet.View className="p-0 sm:max-w-4xl">
        <Form {...form}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Sheet.Header>
              <IconChessKnight />
              <Sheet.Title>{t('cover-detail')}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              {posCovers && (
                <div className="flex flex-col gap-4 w-full my-4">
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      {t('begin-date')}
                    </span>
                    <span className="text-base font-medium">
                      {dayjs(posCovers.beginDate).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      {t('end-date')}
                    </span>
                    <span className="text-base font-medium">
                      {dayjs(posCovers.endDate).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      {t('user')}
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      {t('pos')}
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.posName}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      {t('total-amount')}
                    </span>
                    <span className="text-base font-medium">
                      {(posCovers.details || [])
                        .flatMap((d) => d?.paidSummary || [])
                        .reduce((sum, s) => sum + (s?.amount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      {t('description')}
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.description}
                    </span>
                  </div>

                  <div className="rounded-md overflow-hidden relative">
                    <RecordTable.Provider
                      columns={itemColumns}
                      data={(posCovers.details || []).flatMap((d) =>
                        (d?.paidSummary || []).map((s) => ({
                          paidType: d.paidType,
                          kind: s.kind,
                          kindOfVal: s.kindOfVal,
                          value: s.value,
                          amount: s.amount,
                        })),
                      )}
                      className="w-full"
                    >
                      <RecordTable>
                        <RecordTable.Header />
                        <RecordTable.Body>
                          <RecordTable.RowList />
                        </RecordTable.Body>
                      </RecordTable>
                    </RecordTable.Provider>

                    {(!posCovers.details || posCovers.details.length === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-center">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t('no-payment-details')}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {t('cover-no-payment-breakdown')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Sheet.Content>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
