import { DealCardProducts } from '@/deals/boards/components/DealsBoardCardDetails';
import { CoverDescription } from '@/pos/pos-covers/components/CoverDescription';
import { CoverPaidType } from '@/pos/pos-covers/components/CoverPaidType';
import { POS_COVER_DETAIL_QUERY } from '@/pos/pos-covers/detail/graphql/queries/posCoverDetailQuery';
import { usePosCoversEdit } from '@/pos/pos-covers/detail/hook/usePosCoversEdit';
import { usePosCoversQuery } from '@/pos/pos-covers/detail/hook/usePosCoversQuery';
import { posCovers as POS_COVERS_QUERY } from '@/pos/pos-covers/graphql/queries/queries';
import { useRemovePosCover } from '@/pos/pos-covers/hooks/usePosCoverRemove';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconBuildingStore,
  IconCalendar,
  IconCalendarDue,
  IconCircleDot,
  IconClock,
  IconClockEdit,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Button,
  Empty,
  Form,
  isDefined,
  Skeleton,
  Textarea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PanelField, useSidePanel } from 'ui-modules';
import {
  PosPanelAside,
  PosPanelDetailLayout,
  PosPanelFields,
  PosPanelText,
} from '~/widgets/record-panel/PosPanelShared';

const formatDate = (value?: string | number | Date | null) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';

const CASH_PAID_TYPE = 'cashAmount';

const coverNoteSchema = z.object({ note: z.string() });

const PosCoverNoteForm = ({
  coverId,
  note,
}: {
  coverId: string;
  note?: string | null;
}) => {
  const { t } = useTranslation('sales');
  const { toast } = useToast();
  const { posCoversEdit, loading } = usePosCoversEdit();
  const form = useForm<z.infer<typeof coverNoteSchema>>({
    resolver: zodResolver(coverNoteSchema),
    defaultValues: { note: note || '' },
  });
  const { reset } = form;

  useEffect(() => {
    reset({ note: note || '' });
  }, [coverId, note, reset]);

  const onSubmit = form.handleSubmit(({ note: nextNote }) =>
    posCoversEdit({
      variables: { id: coverId, note: nextNote },
      refetchQueries: [POS_COVER_DETAIL_QUERY, POS_COVERS_QUERY],
      awaitRefetchQueries: true,
      onCompleted: () => toast({ description: t('note-saved') }),
    }).catch(() => undefined),
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <Form.Field
          control={form.control}
          name="note"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('sales-cover-note')}</Form.Label>
              <Form.Control>
                <Textarea {...field} rows={4} disabled={loading} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button
          type="submit"
          className="self-end"
          disabled={loading || !form.formState.isDirty}
        >
          {t('save')}
        </Button>
      </form>
    </Form>
  );
};

export const PosCoverPanelTitle = ({ coverId }: { coverId: string }) => {
  const { t } = useTranslation('sales');
  const { posCovers: cover, loading } = usePosCoversQuery(coverId);

  if (loading && !cover) {
    return <Skeleton className="h-4 w-32" />;
  }

  return cover?.posName || t('cover-detail');
};

export const PosCoverPanelActions = ({ coverId }: { coverId: string }) => {
  const { t } = useTranslation('sales');
  const { removePosCover, loading } = useRemovePosCover();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { close } = useSidePanel();

  const handleDelete = () =>
    confirm({ message: t('delete-pos-cover-single-confirm') }).then(() =>
      removePosCover([coverId], {
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('deleted'),
          });
          close();
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      }),
    );

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-destructive"
      title={t('delete')}
      aria-label={t('delete')}
      disabled={loading}
      onClick={handleDelete}
    >
      <IconTrash />
    </Button>
  );
};

export const PosCoverPanelDetail = ({ coverId }: { coverId: string }) => {
  const { t } = useTranslation('sales');
  const { posCovers: cover, loading } = usePosCoversQuery(coverId);
  const details = (cover?.details || []).filter(isDefined);
  const total = details
    .flatMap((detail) => detail.paidSummary || [])
    .reduce((sum, summary) => sum + (summary?.amount || 0), 0);

  return (
    <PosPanelDetailLayout
      loading={loading}
      hasRecord={!!cover}
      emptyMessage={t('cover-not-found')}
    >
      {cover && (
        <>
          <PosPanelFields>
            <PanelField
              icon={IconCalendar}
              label={t('begin-date')}
              cell={false}
            >
              <PosPanelText>{formatDate(cover.beginDate)}</PosPanelText>
            </PanelField>
            <PanelField
              icon={IconCalendarDue}
              label={t('end-date')}
              cell={false}
            >
              <PosPanelText>{formatDate(cover.endDate)}</PosPanelText>
            </PanelField>
            <PanelField icon={IconUser} label={t('user')} cell={false}>
              <PosPanelText>
                {cover.user?.email || cover.user?.username || '-'}
              </PosPanelText>
            </PanelField>
            <PanelField icon={IconBuildingStore} label={t('pos')} cell={false}>
              <PosPanelText>{cover.posName || '-'}</PosPanelText>
            </PanelField>
            <PanelField icon={IconCircleDot} label={t('status')} cell={false}>
              <PosPanelText>
                {cover.status ? t(cover.status) : '-'}
              </PosPanelText>
            </PanelField>
            <PanelField icon={IconClock} label={t('created-at')} cell={false}>
              <PosPanelText>{formatDate(cover.createdAt)}</PosPanelText>
            </PanelField>
            <PanelField
              icon={IconClockEdit}
              label={t('modified-at')}
              cell={false}
            >
              <PosPanelText>{formatDate(cover.modifiedAt)}</PosPanelText>
            </PanelField>
          </PosPanelFields>
          <PosPanelAside>
            <CoverDescription description={cover.description} />
            <div className="flex items-center justify-between gap-2 px-1 text-sm font-medium">
              <span>{t('total-amount')}</span>
              <span className="tabular-nums">{total.toLocaleString()}</span>
            </div>
            {details.length ? (
              <div className="flex flex-col gap-2 pt-2">
                {details.map((detail) => {
                  const isCash = detail.paidType === CASH_PAID_TYPE;

                  return (
                    <DealCardProducts
                      key={detail._id}
                      label={<CoverPaidType detail={detail} />}
                      totalLabel={t('total')}
                      items={(detail.paidSummary || [])
                        .filter(isDefined)
                        .map((summary, index) => ({
                          _id: summary._id || `${index}`,
                          name: isCash
                            ? (summary.kindOfVal || 0).toLocaleString()
                            : detail.paidType || '-',
                          quantity: isCash ? summary.value || 0 : 1,
                          unitPrice: isCash
                            ? summary.kindOfVal || 0
                            : summary.amount || 0,
                          amount: summary.amount || 0,
                        }))}
                      maxVisible={(detail.paidSummary || []).length}
                    />
                  );
                })}
              </div>
            ) : (
              <Empty className="py-6">
                <Empty.Header>
                  <Empty.Title>{t('no-payment-details')}</Empty.Title>
                  <Empty.Description>
                    {t('cover-no-payment-breakdown')}
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            )}
            {cover._id && (
              <PosCoverNoteForm coverId={cover._id} note={cover.note} />
            )}
          </PosPanelAside>
        </>
      )}
    </PosPanelDetailLayout>
  );
};
