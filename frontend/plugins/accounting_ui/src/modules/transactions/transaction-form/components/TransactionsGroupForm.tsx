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
import { memo, useEffect, useMemo, useState } from 'react';
import { FieldErrors, useForm, useWatch } from 'react-hook-form';
import { currentUserState, IUser, SelectMember } from 'ui-modules';
import {
  TR_STATUS_GROUPS,
  TR_STATUS_LABELS,
  TR_STATUSES,
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
  canRequestTrApproval,
  hasSavedWorkflow,
  isAddressedTrStatus,
  isTrResponder,
} from '../utils/statusWorkflow';
import { TrWorkflowActions } from './TrWorkflowActions';
import type { AccountingTransactionDecision } from '~/gql/graphql';
import { TRANSACTIONS_DETAIL_QUERY } from '../graphql/queries/accTransactionsDetail';
import { useTransactionsDecide } from '../hooks/useTransactionsDecide';

// Memoize form fields to prevent unnecessary re-renders
const FormFields = memo(
  ({
    form,
    hideWorkflowFields,
  }: {
    form: ReturnType<typeof useForm<TAddTransactionGroup>>;
    /** The approver decision view hides status, performer and recipients. */
    hideWorkflowFields?: boolean;
  }) => {
    const { t } = useTranslation('accounting');
    const status = useWatch({ control: form.control, name: 'status' });
    const addressed = isAddressedTrStatus(status);

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
        {!hideWorkflowFields && (
          <>
            <Form.Field
              control={form.control}
              name="status"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('status')}</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      {/* The grouped status list is taller than the menu; Radix
                      scroll buttons mount mid-scroll and shift the list, so
                      hide them and keep native scrolling within the screen. */}
                      <Select.Content className="max-h-[min(24rem,var(--radix-select-content-available-height))] [&>[aria-hidden=true]]:hidden">
                        {TR_STATUS_GROUPS.map((group, groupIndex) => (
                          <Select.Group key={group.label}>
                            {group.values.length > 1 && (
                              <Select.Label>{t(group.label)}</Select.Label>
                            )}
                            {group.values.map((value) => (
                              <Select.Item key={value} value={value}>
                                {t(TR_STATUS_LABELS[value])}
                              </Select.Item>
                            ))}
                            {groupIndex < TR_STATUS_GROUPS.length - 1 && (
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
            {addressed && (
              <Form.Field
                control={form.control}
                name="mentionUserIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('approver')}</Form.Label>
                    <SelectMember.FormItem
                      onValueChange={(users) =>
                        field.onChange(Array.isArray(users) ? users : [])
                      }
                      value={field.value ?? []}
                      mode="multiple"
                      placeholder={t('select-approvers')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}
          </>
        )}
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
  const { decide, loading: deciding } = useTransactionsDecide();
  const [manageOpen, setManageOpen] = useState(false);
  const { isDirty } = form.formState;
  const [currentStatus, currentMentionUserIds] = useWatch({
    control: form.control,
    name: ['status', 'mentionUserIds'],
  });

  const onSubmit = (data: TAddTransactionGroup, onSaved?: () => void) => {
    if (error) {
      return;
    }
    if (data.trDocs?.some(isHiddenTransaction)) {
      return;
    }

    if (isAddressedTrStatus(data.status) && !data.mentionUserIds?.length) {
      form.setError('mentionUserIds', {
        message: t(
          data.status === TR_STATUSES.REQUESTED
            ? 'select-approvers'
            : 'select-addressees',
        ),
      });
      return;
    }

    const trDocs = cleanTrDocs(data);

    if (parentId) {
      updateTransaction({
        variables: { parentId, trDocs },
        refetchQueries: [
          { query: TRANSACTIONS_DETAIL_QUERY, variables: { _id: parentId } },
        ],
        onCompleted: () => onSaved?.(),
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
  const responder = !!parentId && isTrResponder(savedWorkflow, currentUser._id);
  const decisionView = responder && !manageOpen;
  const showDecision =
    responder &&
    hasSavedWorkflow(savedWorkflow, {
      status: currentStatus,
      mentionUserIds: currentMentionUserIds,
    });

  const onError = (errors: FieldErrors<TAddTransactionGroup>) => {
    const trDocErrors = errors.trDocs;

    if (Array.isArray(trDocErrors) && trDocErrors.length > 0) {
      setActiveJournal(trDocErrors.findIndex((tab) => !!tab).toString());
    }
  };

  // A decision applies to the saved voucher. Edits made in the form are
  // saved first through the ordinary update, then the decision follows.
  const onDecide = (decision: AccountingTransactionDecision, note?: string) => {
    if (!parentId) {
      return;
    }
    const run = () => decide(parentId, decision, note);

    if (!isDirty) {
      run();
      return;
    }
    form.handleSubmit((data) => onSubmit(data, run), onError)();
  };

  // Turning the manage view off restores the saved status and recipients,
  // which brings Approve and Decline back.
  const onManageChange = (open: boolean) => {
    setManageOpen(open);
    if (!open) {
      form.setValue('status', savedWorkflow.status ?? '', { shouldDirty: true });
      form.setValue('mentionOwnerId', savedWorkflow.mentionOwnerId, { shouldDirty: true });
      form.setValue('mentionUserIds', savedWorkflow.mentionUserIds, { shouldDirty: true });
    }
  };

  // Request approval saves the current form with the chosen approvers
  // without touching it, so a failed save loses nothing.
  const onRequestApproval = (approverIds: string[]) =>
    form.handleSubmit(
      (data) =>
        onSubmit({
          ...data,
          status: TR_STATUSES.REQUESTED,
          mentionOwnerId: currentUser._id,
          mentionUserIds: approverIds,
        }),
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
      const currentTr = activeTrs.find((tr) => tr._id === trId) ?? activeTrs[0];
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
    if (!parentId && defaultJournal) {
      form.reset({
        ...form.getValues(),
        date: new Date(),
        status: TR_STATUSES.COMPLETE,
        mentionOwnerId: currentUser._id,
        trDocs: [JOURNALS_BY_JOURNAL(defaultJournal)],
      });
    }

    setFollowTrDocs(followTrs);
  }, [
    activeTrs,
    currentUser._id,
    defaultJournal,
    followTrs,
    form,
    loading,
    parentId,
    setFollowTrDocs,
    trId,
  ]);

  if (configsLoading || loading) {
    return <Spinner />;
  }

  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit((data) => onSubmit(data), onError)}
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
              hideRecordActions={decisionView}
              workflowActions={
                <TrWorkflowActions
                  responder={responder}
                  showDecision={showDecision}
                  manageOpen={manageOpen}
                  onManageChange={onManageChange}
                  canRequestApproval={canRequestTrApproval(
                    parentId ? savedWorkflow.status : undefined,
                  )}
                  disabled={
                    !!error || createLoading || updateLoading || deciding
                  }
                  onApprove={() => onDecide('APPROVE')}
                  onDecline={(note) => onDecide('DECLINE', note)}
                  onRequestApproval={onRequestApproval}
                />
              }
            />
          </div>
        </div>
        <FormFields form={form} hideWorkflowFields={decisionView} />
        <TransactionsTabsList form={form} />
      </form>
    </Form>
  );
};
