import { zodResolver } from '@hookform/resolvers/zod';
import type { Editor as TiptapEditor } from '@tiptap/core';
import {
  EmailEditorVariable,
  JSONContent,
  renderEmailHtml,
  useConfirm,
} from 'erxes-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getTemplateFormSchema,
  TTemplateForm,
} from '../schema/templateFormSchema';
import { TNotificationTemplate, TNotificationTemplateInput } from '../types';
import { composeTemplateDoc } from '../utils/composeTemplateDoc';
import { useNotificationTemplateDetail } from './useNotificationTemplateDetail';
import { useNotificationTemplateMutations } from './useNotificationTemplateMutations';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

const toSnapshot = (json?: JSONContent) => JSON.stringify(json || {});

/**
 * Everything the template editor does: what it starts from, whether it has
 * unsaved changes, and saving, publishing, reverting and sending a test.
 */
export const useNotificationTemplateEditor = (templateKey: string) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { confirm } = useConfirm();
  const { template, loading, refetch } =
    useNotificationTemplateDetail(templateKey);
  const mutations = useNotificationTemplateMutations(templateKey);

  const schema = useMemo(() => getTemplateFormSchema(t), [t]);
  const form = useForm<TTemplateForm>({
    resolver: zodResolver(schema),
    defaultValues: { subject: '', preheader: '' },
  });
  const [subject, preheader] = useWatch({
    control: form.control,
    name: ['subject', 'preheader'],
  });

  const [contentJson, setContentJson] = useState<JSONContent>();
  const [savedSnapshot, setSavedSnapshot] = useState<string>();
  const [loadedKey, setLoadedKey] = useState<string>();
  // the editor keeps the content it was created with, so a reload rebuilds it
  const [editorKey, setEditorKey] = useState(0);
  // the revision this page last saw; a save from an older one is a conflict
  const revision = useRef(0);

  const load = useCallback(
    (next: TNotificationTemplate) => {
      const source = next.draft || next.published;

      form.reset({
        subject: source?.subject || next.defaultSubject || '',
        preheader: source?.preheader || '',
      });
      setContentJson(source?.contentJson || next.starterJson || undefined);
      setSavedSnapshot(undefined);
      revision.current = next.draftRevision;
      setLoadedKey(next.key);
      setEditorKey((value) => value + 1);
    },
    [form],
  );

  // loaded once per template; later refetches only refresh the status
  useEffect(() => {
    if (template && template.key !== loadedKey) {
      load(template);
    }
  }, [template, loadedKey, load]);

  // the editor normalizes what it is given, so that is what counts as saved
  const onEditorCreate = useCallback((editor: TiptapEditor) => {
    const json = editor.getJSON();

    setContentJson(json);
    setSavedSnapshot(toSnapshot(json));
  }, []);

  const contentDirty =
    savedSnapshot !== undefined && toSnapshot(contentJson) !== savedSnapshot;
  const isDirty = form.formState.isDirty || contentDirty;

  const blocker = useUnsavedChangesGuard(isDirty);

  const variables = useMemo<EmailEditorVariable[]>(
    () =>
      (template?.variables || []).map(({ name, label }) => ({
        name,
        label,
        required: false,
      })),
    [template?.variables],
  );

  const buildInput = async (
    values: TTemplateForm,
  ): Promise<TNotificationTemplateInput> => {
    const json = contentJson || { type: 'doc', content: [] };
    const previewText = values.preheader || undefined;

    return {
      subject: values.subject,
      preheader: previewText,
      contentJson: json,
      content: await renderEmailHtml(composeTemplateDoc(json), {
        previewText,
      }),
    };
  };

  const markSaved = (saved?: TNotificationTemplate) => {
    if (!saved) {
      return;
    }

    revision.current = saved.draftRevision;
    form.reset(form.getValues());
    setSavedSnapshot(toSnapshot(contentJson));
  };

  const saveDraft = form.handleSubmit(async (values) =>
    markSaved(
      await mutations.saveDraft(revision.current, await buildInput(values)),
    ),
  );

  const publish = form.handleSubmit(async (values) =>
    markSaved(
      await mutations.publish(revision.current, await buildInput(values)),
    ),
  );

  const sendTest = form.handleSubmit(async (values) =>
    mutations.sendTest(await buildInput(values)),
  );

  const revert = () =>
    confirm({
      message: t('revert-confirm'),
      options: { okLabel: t('revert-to-default') },
    }).then(() => mutations.revert());

  const reload = async () => {
    const { data } = await refetch();

    mutations.clearConflict();

    if (data?.notificationTemplateDetail) {
      load(data.notificationTemplateDetail);
    }
  };

  return {
    template,
    loading: loading || (!!template && template.key !== loadedKey),
    form,
    subject,
    preheader,
    contentJson,
    setContentJson,
    onEditorCreate,
    editorKey,
    variables,
    isDirty,
    blocker,
    saving: mutations.saving,
    sendingTest: mutations.sendingTest,
    conflict: mutations.conflict,
    saveDraft,
    publish,
    sendTest,
    revert,
    reload,
  };
};
