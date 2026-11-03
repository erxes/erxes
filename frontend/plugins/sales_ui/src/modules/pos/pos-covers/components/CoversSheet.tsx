import { CoverPaidType, type CoverPaymentDetail } from './CoverPaidType';
import { CoverDescription } from './CoverDescription';
import {
  IconChessKnight,
  IconShoppingCart,
  IconTag,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import dayjs from 'dayjs';
import {
  Button,
  Form,
  isDefined,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  Spinner,
  Textarea,
  TextOverflowTooltip,
  useToast,
} from 'erxes-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { usePosCoversQuery } from '../detail/hook/usePosCoversQuery';
import { usePosCoversEdit } from '../detail/hook/usePosCoversEdit';
import { POS_COVER_DETAIL_QUERY } from '../detail/graphql/queries/posCoverDetailQuery';
import { posCovers as POS_COVERS_QUERY } from '../graphql/queries/queries';
import { z } from 'zod';

const coverNoteSchema = z.object({ note: z.string() });

interface ICoverItemRow {
  paidType: string;
  payment: CoverPaymentDetail;
  kind: string;
  kindOfVal: string;
  value: string;
  amount: number;
}

const itemColumns: (t: TFunction) => ColumnDef<ICoverItemRow>[] = (t) => [
  {
    id: 'paidType',
    accessorKey: 'paidType',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label={t('type')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <CoverPaidType detail={row.original.payment} />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('kind')} />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('kind-of-val')} />
    ),
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
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('value')} />,
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
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('amount')} />,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const posCoverId = searchParams.get('pos_cover_id') || '';
  const updatePosCoverId = React.useCallback(
    (coverId: string) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        if (coverId) next.set('pos_cover_id', coverId);
        else next.delete('pos_cover_id');
        return next;
      });
    },
    [setSearchParams],
  );

  const { posCovers, loading, error, refetch } = usePosCoversQuery(
    posCoverId || undefined,
  );
  const { posCoversEdit, loading: saving } = usePosCoversEdit();
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const coverItemColumns = React.useMemo(() => itemColumns(t), [t]);

  const form = useForm<z.infer<typeof coverNoteSchema>>({
    resolver: zodResolver(coverNoteSchema),
    defaultValues: {
      note: '',
    },
  });

  const { reset } = form;
  React.useEffect(() => {
    reset({ note: posCovers?.note || '' });
  }, [posCoverId, posCovers?._id, posCovers?.note, reset]);

  const onSubmit = form.handleSubmit(async ({ note }) => {
    if (!posCovers || loading || error || saving) return;

    await posCoversEdit({
      variables: { id: posCoverId, note },
      refetchQueries: [POS_COVER_DETAIL_QUERY, POS_COVERS_QUERY],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast({ description: t('note-saved') });
      },
    }).catch(() => undefined);
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
          <form className="flex flex-col gap-0 size-full" onSubmit={onSubmit}>
            <Sheet.Header className="shrink-0">
              <IconChessKnight />
              <Sheet.Title>{t('cover-detail')}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="min-h-0 flex-1 overflow-auto flex flex-col px-5 py-4">
              {loading && <Spinner />}
              {error && (
                <div role="alert" className="flex flex-col items-start gap-2">
                  <p className="text-destructive">{error.message}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void refetch().catch(() => undefined)}
                  >
                    {t('retry')}
                  </Button>
                </div>
              )}
              {!loading && !error && !posCovers && (
                <p className="text-muted-foreground">{t('cover-not-found')}</p>
              )}
              {posCovers && !error && (
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('created-at')}</p>
                      <p>
                        {posCovers.createdAt
                          ? dayjs(posCovers.createdAt).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {t('modified-at')}
                      </p>
                      <p>
                        {posCovers.modifiedAt
                          ? dayjs(posCovers.modifiedAt).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <CoverDescription description={posCovers.description} />

                  <div className="rounded-md overflow-hidden relative">
                    <RecordTable.Provider
                      columns={coverItemColumns}
                      data={(posCovers.details || [])
                        .filter(isDefined)
                        .flatMap((d) =>
                          (d.paidSummary || []).filter(isDefined).map((s) => ({
                            paidType: d.paidType,
                            payment: d,
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
                  <Form.Field
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('sales-cover-note')}</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...field}
                            rows={4}
                            disabled={saving || loading}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              )}
            </Sheet.Content>
            <Sheet.Footer className="shrink-0">
              <Button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  !!error ||
                  !posCovers ||
                  !form.formState.isDirty
                }
              >
                {saving && <Spinner size="sm" />}
                {t('save-note')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
