import type { EmailTemplate } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useLeaveWarning } from '~/lib/useLeaveWarning';
import { usePlan } from '~/modules/saas/usePlan';
import { type EmailNode, sameDocument, toEmailDocument } from '../emailDocument';

/** Templates come with self-hosted erxes: false on SaaS, and while the plan is still loading. */
export const useTemplatesOffered = () => usePlan().data?.saas === false;

/** After a template changes: every template query refreshes, and a failure says why. */
export const useTemplateHandlers = (done?: string) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: orpc.emailTemplates.key() });

      if (done) toast({ title: done });
    },
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'The template was not saved'),
        description: messageOf(error),
      }),
  };
};

/** An empty message, for a template written from scratch. */
const BLANK: EmailNode = { type: 'doc', content: [{ type: 'paragraph' }] };

/** Creates an empty template under a name and opens it. */
export const useCreateTemplate = () => {
  const navigate = useNavigate();
  const handlers = useTemplateHandlers();

  const create = useMutation(
    orpc.emailTemplates.create.mutationOptions({
      ...handlers,
      onSuccess: async (template) => {
        await handlers.onSuccess();
        void navigate(paths.broadcasts.template(template.id));
      },
    }),
  );

  return {
    pending: create.isPending,
    create: (name: string) => create.mutate({ name: name.trim(), content: BLANK }),
  };
};

/** Deletes a template after asking; emails made with it keep their message. */
export const useRemoveTemplate = (onRemoved?: () => void) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const { confirm } = useConfirm();
  const handlers = useTemplateHandlers(t('deleted', 'Template deleted'));

  const remove = useMutation(
    orpc.emailTemplates.remove.mutationOptions({
      ...handlers,
      onSuccess: async () => {
        onRemoved?.();
        await handlers.onSuccess();
      },
    }),
  );

  return {
    pending: remove.isPending,
    remove: (template: { id: string; name: string }) =>
      void confirm({
        message: t('delete-confirm', 'Delete “{{name}}”? Emails made with it keep their message.', {
          name: template.name,
        }),
        options: { okLabel: t('delete', 'Delete') },
      }).then(() => remove.mutate({ id: template.id })),
  };
};

type Draft = Pick<EmailTemplate, 'name' | 'content'>;

/** The editor's copy of a template, saved on demand; a change saved elsewhere replaces a clean one. */
export const useTemplateDraft = (template: EmailTemplate) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const [draft, setDraft] = useState<Draft>({ name: template.name, content: template.content });
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(template.updatedAt);
  const handlers = useTemplateHandlers(t('saved-changes', 'Template saved'));

  if (template.updatedAt !== savedAt && !dirty) {
    setSavedAt(template.updatedAt);
    // Keep the editor's own document when it says the same: a new one resets its cursor.
    setDraft((current) => ({
      name: template.name,
      content: sameDocument(current.content, template.content) ? current.content : template.content,
    }));
  }

  useLeaveWarning(dirty);

  const update = useMutation(
    orpc.emailTemplates.update.mutationOptions({
      ...handlers,
      onSuccess: async () => {
        setDirty(false);
        await handlers.onSuccess();
      },
    }),
  );

  const content = toEmailDocument(draft.content);

  return {
    draft,
    dirty,
    saving: update.isPending,
    change: (patch: Partial<Draft>) => {
      setDraft((current) => ({ ...current, ...patch }));
      setDirty(true);
    },
    save: () =>
      update.mutate({
        id: template.id,
        name: draft.name.trim() || template.name,
        ...(content ? { content } : {}),
      }),
  };
};
