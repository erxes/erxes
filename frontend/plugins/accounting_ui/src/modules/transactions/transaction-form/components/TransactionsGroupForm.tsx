import { useTranslation } from 'react-i18next';
import { useMainConfigs } from '@/settings/hooks/useMainConfigs';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DatePicker,
  Form,
  Input,
  Select,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useEffect, useMemo } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { currentUserState, IUser, SelectMember } from 'ui-modules';
import {
  TR_STATUS_GROUPS,
  TR_STATUSES,
  TR_STATUS_OPTIONS,
  TrJournalEnum,
} from '../../types/constants';
import { JOURNALS_BY_JOURNAL } from '../contants/defaultValues';
import { transactionGroupSchema } from '../contants/transactionSchema';
import { useTransactionsCreate } from '../hooks/useTransactionsCreate';
import { useTransactionsDetail } from '../hooks/useTransactionsDetail';
import { useTransactionsUpdate } from '../hooks/useTransactionsUpdate';
import { activeJournalState, followTrDocsState } from '../states/trStates';
import { TAddTransactionGroup } from '../types/JournalForms';
import { Summary } from './Summary';
import { TransactionsTabsList } from './TransactionTabs';
import { cleanTrDocs, isHiddenTransaction } from './utils';
import {
  getAvailableTrStatusOptions,
  getNextMentionFields,
  TTrWorkflowFields,
} from '../utils/statusWorkflow';
import { TrWorkflowActions } from './TrWorkflowActions';

// Memoize form fields to prevent unnecessary re-renders
const FormFields = memo(
  ({
    form,
    currentUserId,
  }: {
    form: ReturnType<typeof useForm<TAddTransactionGroup>>;
    currentUserId?: string;
  }) => {
    const { t } = useTranslation('accounting');
    const status = form.watch('status');
    const mentionOwnerId = form.watch('mentionOwnerId');
    const mentionUserIds = form.watch('mentionUserIds');
    const statusOptions = getAvailableTrStatusOptions(
      {
        currentUserId,
        mentionOwnerId,
        mentionUserIds,
        status,
      },
      TR_STATUS_OPTIONS,
    );
    const statusOptionsByValue = new Map(
      statusOptions.map((option) => [option.value, option]),
    );
    const statusGroups = TR_STATUS_GROUPS.map((group) => ({
      ...group,
      options: group.values
        .map((value) => statusOptionsByValue.get(value))
        .filter((option): option is (typeof statusOptions)[number] =>
          Boolean(option),
        ),
    })).filter((group) => group.options.length);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 py-6">
        <Form.Field
          control={form.control}
          name="date"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('date')}</Form.Label>
              <Form.Control>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  className="flex w-full"
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="number"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('number')}</Form.Label>
              <Form.Control>
                <Input {...field} value={field.value ?? ''} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="status"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('status')}</Form.Label>
              <Form.Control>
                <Select
                  value={field.value}
                  onValueChange={(nextStatus) => {
                    field.onChange(nextStatus);

                    const nextMentionFields = getNextMentionFields({
                      currentUserId,
                      nextStatus,
                      mentionOwnerId,
                      mentionUserIds,
                    });

                    form.setValue(
                      'mentionOwnerId',
                      nextMentionFields.mentionOwnerId,
                    );
                    form.setValue(
                      'mentionUserIds',
                      nextMentionFields.mentionUserIds,
                    );
                  }}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  {/* The grouped status list is taller than the menu; Radix
                      scroll buttons mount mid-scroll and shift the list, so
                      hide them and keep native scrolling within the screen. */}
                  <Select.Content className="max-h-[min(24rem,var(--radix-select-content-available-height))] [&>[aria-hidden=true]]:hidden">
                    {statusGroups.map((group, groupIndex) => (
                      <Select.Group key={group.label}>
                        {group.label && (
                          <Select.Label>
                            {t(group.label, { nsSeparator: false })}
                          </Select.Label>
                        )}
                        {group.options.map((side) => (
                          <Select.Item key={side.value} value={side.value}>
                            {t(side.label || '', { nsSeparator: false })}
                          </Select.Item>
                        ))}
                        {groupIndex < statusGroups.length - 1 && (
                          <Select.Separator />
                        )}
                      </Select.Group>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="mentionOwnerId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('performed-by')}</Form.Label>
              <Form.Control>
                <SelectMember.FormItem
                  onValueChange={(user) => field.onChange(user || '')}
                  value={field.value}
                  mode="single"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="mentionUserIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('approve')}</Form.Label>
              <Form.Control>
                <SelectMember.FormItem
                  onValueChange={(users) => field.onChange(users || [])}
                  value={field.value}
                  mode="multiple"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    );
  },
);

FormFields.displayName = 'FormFields';

export const TransactionsGroupForm = () => {
  const { t } = useTranslation('accounting');
  // const parentId = useParams().parentId;
  const currentUser = useAtomValue(currentUserState) as IUser;
  const [parentId] = useQueryState<string>('parentId');
  const { activeTrs, error, followTrs, loading } = useTransactionsDetail({
    variables: { _id: parentId ?? '' },
    skip: !parentId,
  });

  const { loading: configsLoading } = useMainConfigs();
  const form = useForm<TAddTransactionGroup>({
    resolver: zodResolver(transactionGroupSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const [defaultJournal] = useQueryState<TrJournalEnum>('defaultJournal');
  const [trId] = useQueryState<string>('trId');

  const setActiveJournal = useSetAtom(activeJournalState);
  const setFollowTrDocs = useSetAtom(followTrDocsState);

  const { createTransaction, loading: createLoading } = useTransactionsCreate();
  const { updateTransaction, loading: updateLoading } = useTransactionsUpdate();

  // The status select already applies the mention changes for `returned`,
  // so submit the form's mention fields as they are.
  const onSubmit = (data: TAddTransactionGroup) => {
    if (error) {
      return;
    }
    if (data.trDocs?.some(isHiddenTransaction)) {
      return;
    }

    const trDocs = cleanTrDocs(data);

    if (parentId) {
      updateTransaction({
        variables: { parentId, trDocs },
      });
    } else {
      createTransaction({
        variables: { trDocs },
      });
    }
  };

  const savedTr = activeTrs?.[0];
  const savedWorkflow = useMemo(
    () => ({
      status: savedTr?.status ?? undefined,
      mentionOwnerId: savedTr?.mentionOwnerId ?? undefined,
      mentionUserIds: savedTr?.mentionUserIds ?? [],
    }),
    [savedTr?.status, savedTr?.mentionOwnerId, savedTr?.mentionUserIds],
  );

  const onError = (errors: FieldErrors<TAddTransactionGroup>) => {
    const trDocErrors = errors.trDocs;

    if (Array.isArray(trDocErrors) && trDocErrors.length > 0) {
      setActiveJournal(trDocErrors.findIndex((tab) => !!tab).toString());
    }
  };

  // Workflow actions save the current form with the action's status and
  // mention fields without touching the form, so a failed save loses nothing.
  const onWorkflowAction = (fields: TTrWorkflowFields) =>
    form.handleSubmit(
      (data) => onSubmit({ ...data, ...fields }),
      onError,
    )();

  useEffect(() => {
    if (parentId && activeTrs && !activeTrs.length) {
      form.reset({
        date: new Date(),
        status: TR_STATUSES.COMPLETE,
        mentionOwnerId: currentUser._id,
        mentionUserIds: [],
        trDocs: [],
      });
      setFollowTrDocs([]);
      return;
    }

    if (activeTrs?.length && parentId) {
      const currentTr = trId
        ? activeTrs.find((tr) => tr._id === trId)
        : activeTrs[0];
      // setting form values
      form.reset({
        ...form.getValues(),
        parentId,
        number: currentTr?.number || 'auto',
        ptrNumber: currentTr?.ptrNumber,
        contentType: currentTr?.contentType,
        contentId: currentTr?.contentId,
        date: new Date(currentTr?.date || new Date()),
        status: currentTr?.status || TR_STATUSES.COMPLETE,
        mentionOwnerId: currentTr?.mentionOwnerId || currentUser._id,
        mentionUserIds: currentTr?.mentionUserIds ?? [],
        trDocs: activeTrs.map((atr) =>
          JOURNALS_BY_JOURNAL(atr?.journal || '', atr),
        ),
      });
    }
    if (defaultJournal) {
      form.reset({
        ...form.getValues(),
        date: new Date(),
        status: TR_STATUSES.COMPLETE,
        mentionOwnerId: currentUser._id,
        trDocs: [JOURNALS_BY_JOURNAL(defaultJournal)],
      });
    }

    setFollowTrDocs(followTrs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrs, defaultJournal, followTrs, form, loading, parentId, trId]);

  if (configsLoading || loading) {
    return <Spinner />;
  }

  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <div className="flex justify-between">
          <h3 className="text-lg font-bold">
            {parentId ? t('edit-transaction') : t('create-transaction')}
          </h3>
          <div className="">
            <Summary
              errorMessage={error?.message}
              form={form}
              saving={createLoading || updateLoading}
              workflowActions={
                <TrWorkflowActions
                  currentUserId={currentUser._id}
                  saved={parentId ? savedWorkflow : {}}
                  disabled={!!error || createLoading || updateLoading}
                  onAction={onWorkflowAction}
                />
              }
            />
          </div>
        </div>
        <FormFields form={form} currentUserId={currentUser._id} />
        <TransactionsTabsList form={form} />
      </form>
    </Form>
  );
};
