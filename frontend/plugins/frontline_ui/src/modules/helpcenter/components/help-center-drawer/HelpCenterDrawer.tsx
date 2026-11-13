import { useApolloClient } from '@apollo/client';
import { Form, isDeeplyEqual, Tabs, toast, useConfirm } from 'erxes-ui';
import { useAtomValue, useStore } from 'jotai';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { currentUserState, PanelFormLayout, useSidePanel } from 'ui-modules';
import { HELP_CENTER_CONTENT_TYPE } from '@/helpcenter/constants';
import { HelpCenterAppearanceTab } from '@/helpcenter/components/help-center-drawer/HelpCenterAppearanceTab';
import { HelpCenterDomainTab } from '@/helpcenter/components/help-center-drawer/HelpCenterDomainTab';
import { HelpCenterGeneralTab } from '@/helpcenter/components/help-center-drawer/HelpCenterGeneralTab';
import { HELP_CENTER_FIELD_TAB } from '@/helpcenter/constants';
import { useSaveHelpCenter } from '@/helpcenter/hooks/useSaveHelpCenter';
import { GET_HELP_CENTER } from '@/helpcenter/graphql/queries/getHelpCenters';
import {
  helpCenterNewDraftGenerationState,
  helpCenterPanelCreatedState,
  helpCenterPanelDraftsState,
  helpCenterPanelPendingState,
  helpCenterPanelSessionState,
  helpCenterRemovedIdsState,
  observeHelpCenterSession,
} from '@/helpcenter/states/helpCenterPanelDraftsState';
import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import {
  HELP_CENTER_CREATE_TABS,
  HELP_CENTER_TABS,
  IHelpCenter,
  IHelpCenterConfigInput,
  THelpCenterTab,
} from '@/helpcenter/types';
import { toHelpCenterConfigInput } from '@/helpcenter/utils/toHelpCenterConfigInput';
import type { TCaptureHelpCenterImage } from './HelpCenterStyleFields';
import { TopicEmbedTab } from '@/knowledgebase/shared/components/TopicEmbedTab';

interface HelpCenterDrawerProps {
  readonly helpCenter?: IHelpCenter;
  readonly onClose: () => void;
}

export function HelpCenterDrawer({
  helpCenter,
  onClose,
}: HelpCenterDrawerProps) {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const client = useApolloClient();
  const { openRecord } = useSidePanel();
  const [checking, setChecking] = useState(false);
  const currentUserId = useAtomValue(currentUserState)?._id;
  const store = useStore();
  const userKey = currentUserId ?? '';
  const session = useAtomValue(helpCenterPanelSessionState);
  useEffect(() => observeHelpCenterSession(store), [store]);
  const generation =
    useAtomValue(helpCenterNewDraftGenerationState)[userKey] ?? 0;
  const recordId = helpCenter?._id ?? `new:${generation}`;
  const recordKey = `${userKey}:${recordId}`;
  const created = useAtomValue(helpCenterPanelCreatedState)[recordKey];
  const pending = useAtomValue(helpCenterPanelPendingState).has(recordKey);
  const drafts = useAtomValue(helpCenterPanelDraftsState);
  const uploading = Boolean(drafts[recordKey]?.pendingUpdates?.length);
  const isEditing = !!helpCenter;
  const [selectedTab, setSelectedTab] = useState<THelpCenterTab>('general');
  const tabs = isEditing ? HELP_CENTER_TABS : HELP_CENTER_CREATE_TABS;
  const activeTab = tabs.find((tab) => tab === selectedTab) || 'general';
  const selectTab = (value: string) => {
    const nextTab = tabs.find((tab) => tab === value);
    if (nextTab) setSelectedTab(nextTab);
  };

  const values = useMemo(
    () => created?.values ?? toHelpCenterConfigInput(helpCenter),
    [created, helpCenter],
  );
  const form = useForm<IHelpCenterConfigInput>({
    defaultValues: values,
    mode: 'onChange',
  });
  const { defaultValues } = form.formState;
  const {
    clearDraft,
    markSaved,
    isActive,
    captureUpdate,
    hasPendingUpdates,
    invalidateUpdates,
  } = usePanelFormDraft({
    form,
    recordKey,
    values,
    draftsState: helpCenterPanelDraftsState,
    isNew: !isEditing && !created,
  });
  const captureImageUpdate: TCaptureHelpCenterImage = (name) => {
    const update = captureUpdate(name);
    return (url) => {
      if (store.get(helpCenterPanelSessionState) !== session) return;
      update((latest) => {
        if (url === undefined) return latest;
        if (name === 'backgroundImage')
          return { ...latest, backgroundImage: url };
        if (name === 'footer.logo')
          return { ...latest, footer: { ...latest.footer, logo: url } };
        const style = name === 'styles.mainLogo' ? 'mainLogo' : 'favicon';
        return { ...latest, styles: { ...latest.styles, [style]: url } };
      });
    };
  };
  const { saveHelpCenter, loading: saving } = useSaveHelpCenter();
  const loading = saving || pending || checking;

  const finishNewDraft = () => {
    store.set(helpCenterPanelCreatedState, (previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([key]) => key !== recordKey),
      ),
    );
    store.set(helpCenterNewDraftGenerationState, (previous) => ({
      ...previous,
      [userKey]: Math.max(previous[userKey] ?? 0, generation + 1),
    }));
  };

  const onCancel = async () => {
    if (loading) return;
    if (!isDeeplyEqual(form.getValues(), defaultValues, { strict: true })) {
      await confirm({
        message: t('discard-unsaved-changes', 'Discard your unsaved changes?'),
      });
      if (!isActive()) return;
    }
    clearDraft();
    if (!isEditing) finishNewDraft();
    onClose();
  };

  const loadCreatedValues = async (
    id: string,
  ): Promise<IHelpCenterConfigInput | null> => {
    setChecking(true);
    try {
      const { data: current } = await client.query({
        query: GET_HELP_CENTER,
        variables: { _id: id },
        fetchPolicy: 'network-only',
      });
      if (!current.helpCenterConfig)
        throw new Error(
          t(
            'help-center-load-failed',
            'Unable to load this Help Center. Try saving again.',
          ),
        );
      const currentValues = toHelpCenterConfigInput(current.helpCenterConfig);
      if (!isEditing) delete currentValues._id;
      return currentValues;
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t(
                'help-center-load-failed',
                'Unable to load this Help Center. Try saving again.',
              ),
        variant: 'destructive',
      });
      return null;
    } finally {
      setChecking(false);
    }
  };

  const acknowledgeSave = (
    saved: IHelpCenter,
    submitted: IHelpCenterConfigInput,
  ): void => {
    if (
      store.get(helpCenterPanelSessionState) !== session ||
      store.get(helpCenterRemovedIdsState).has(saved._id)
    )
      return;
    if (
      !isEditing &&
      (store.get(helpCenterNewDraftGenerationState)[userKey] ?? 0) !==
        generation
    )
      return;
    const savedValues = toHelpCenterConfigInput(saved);
    if (!isEditing) {
      delete savedValues._id;
      store.set(helpCenterPanelCreatedState, (previous) => ({
        ...previous,
        [recordKey]: { id: saved._id, values: savedValues },
      }));
    }
    const completed = markSaved(savedValues, submitted);
    const active = isActive();
    if (!isEditing) {
      const remaining = store.get(helpCenterPanelDraftsState)[recordKey];
      const savedKey = `${userKey}:${saved._id}`;
      if (!completed && remaining)
        store.set(helpCenterPanelDraftsState, (previous) => ({
          ...previous,
          [savedKey]: previous[savedKey] ?? {
            ...remaining,
            values: { ...remaining.values, _id: saved._id },
            defaultValues: { ...savedValues, _id: saved._id },
          },
        }));
      clearDraft();
      finishNewDraft();
      if (!completed && active)
        openRecord(
          { contentType: HELP_CENTER_CONTENT_TYPE, contentId: saved._id },
          { replace: true },
        );
    }
    if (completed && active) onClose();
  };

  const onSubmit = async (data: IHelpCenterConfigInput) => {
    if (loading || hasPendingUpdates()) return;
    const submitted = structuredClone(data);
    let currentValues = values;
    const id = helpCenter?._id ?? created?.id;
    if (id) {
      const current = await loadCreatedValues(id);
      if (!current || !isActive()) return;
      currentValues = current;
    }
    if (
      (isEditing || created) &&
      !isDeeplyEqual(currentValues, created?.values ?? defaultValues, {
        strict: true,
      })
    ) {
      await confirm({
        message: t(
          'help-center-changed-during-edit',
          'This Help Center changed while you were editing. Save your draft over the newer settings?',
        ),
      });
      if (!isActive()) return;
    }
    if (
      hasPendingUpdates() ||
      store.get(helpCenterPanelPendingState).has(recordKey) ||
      store.get(helpCenterPanelSessionState) !== session
    )
      return;
    store.set(
      helpCenterPanelPendingState,
      (previous) => new Set([...previous, recordKey]),
    );
    try {
      const result = await saveHelpCenter({
        ...submitted,
        _id:
          helpCenter?._id ??
          store.get(helpCenterPanelCreatedState)[recordKey]?.id,
        title: submitted.title.trim(),
        description: submitted.description.trim(),
        url: submitted.url.trim(),
      });
      const saved = result.data?.helpCenterConfigUpdate;
      if (saved) acknowledgeSave(saved, submitted);
    } finally {
      if (store.get(helpCenterPanelSessionState) === session)
        store.set(
          helpCenterPanelPendingState,
          (previous) =>
            new Set([...previous].filter((key) => key !== recordKey)),
        );
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstField = Object.keys(errors)[0];
    const tab = Object.entries(HELP_CENTER_FIELD_TAB).find(
      ([field]) => field === firstField,
    )?.[1];
    if (tab && tab !== activeTab) selectTab(tab);
  };

  const submit = form.handleSubmit(onSubmit, onInvalid);
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (
      !(submitter instanceof HTMLButtonElement) ||
      submitter.getAttribute('type') !== 'submit' ||
      submitter.form !== event.currentTarget
    ) {
      event.preventDefault();
      return;
    }
    submit(event);
  };

  const kbTopicId = form.watch('kbTopicId');

  const idleLabel =
    isEditing || created
      ? t('kb-save-changes')
      : t('helpcenter-create', 'Create Help Center');
  const busyLabel = isEditing ? t('saving') : t('kb-creating');
  const submitLabel = loading ? busyLabel : idleLabel;
  const tabLabels: Record<THelpCenterTab, string> = {
    general: t('general'),
    appearance: t('appearance'),
    embed: t('kb-embed-script'),
    domain: t('customdomain-label'),
  };

  const tabList = (
    <Tabs.List className="flex w-full flex-wrap gap-x-2 h-auto">
      {tabs.map((tab) => (
        <Tabs.Trigger key={tab} value={tab} className="min-w-0 px-1.5 text-xs">
          {tabLabels[tab]}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
  const navigation = (
    <Tabs
      value={activeTab}
      onValueChange={selectTab}
      className="shrink-0 border-b px-2"
    >
      {tabList}
    </Tabs>
  );
  const general = (
    <div className={activeTab === 'general' ? '' : 'hidden'}>
      <HelpCenterGeneralTab form={form} t={t} />
    </div>
  );
  const appearance = (
    <div className={activeTab === 'appearance' ? '' : 'hidden'}>
      <HelpCenterAppearanceTab
        form={form}
        t={t}
        captureImageUpdate={captureImageUpdate}
        invalidateImageUpdate={invalidateUpdates}
      />
    </div>
  );
  const embed = isEditing && (
    <div className={activeTab === 'embed' ? '' : 'hidden'}>
      {kbTopicId ? (
        <TopicEmbedTab topicId={kbTopicId} t={t} />
      ) : (
        <p className="p-8 text-sm text-center text-muted-foreground">
          {t('select-knowledge-base-topic')}
        </p>
      )}
    </div>
  );
  const domain = helpCenter?._id && activeTab === 'domain' && (
    <HelpCenterDomainTab helpCenterId={helpCenter._id} t={t} compact />
  );
  const body = (
    <PanelFormLayout
      onCancel={onCancel}
      saving={loading || uploading}
      saveLabel={submitLabel}
    >
      {general}
      {appearance}
      {embed}
      {domain}
    </PanelFormLayout>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={onFormSubmit}
        className="flex flex-1 min-h-0 min-w-0 flex-col"
      >
        <fieldset
          disabled={loading}
          className="flex flex-1 min-h-0 min-w-0 flex-col"
        >
          {navigation}
          {body}
        </fieldset>
      </form>
    </Form>
  );
}
