import { orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConfirm } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type EmailNode, hasEmailContent, toEmailDocument } from '../emailDocument';
import { useTemplateHandlers } from './useEmailTemplates';

/**
 * Templates for a message: put one in (replacing the message, after asking when it has any),
 * or keep the message as a new one under the name searched for.
 */
export const useTemplatePicker = (
  content: EmailNode | null,
  onUse: (content: EmailNode) => void,
) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const { confirm } = useConfirm();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const deferred = useDeferredValue(search.trim());
  const handlers = useTemplateHandlers();

  const list = useQuery(
    orpc.emailTemplates.list.queryOptions({
      input: { search: deferred || undefined, limit: 50 },
    }),
  );

  const create = useMutation(
    orpc.emailTemplates.create.mutationOptions(
      useTemplateHandlers(t('saved', 'Saved as a template')),
    ),
  );

  const written = hasEmailContent(content);

  const apply = (id: string) =>
    client
      .query(orpc.emailTemplates.get.queryOptions({ input: { id } }))
      .then((template) => onUse(template.content), handlers.onError);

  return {
    items: list.data?.data ?? [],
    loading: list.isPending,
    error: list.error,
    setSearch,
    canSave: written,
    saving: create.isPending,
    use: (id: string) => {
      if (!written) return void apply(id);

      void confirm({
        message: t('replace', 'Replace the message with this template?'),
        options: { okLabel: t('replace-ok', 'Replace') },
      }).then(() => apply(id));
    },
    saveAs: (name: string) => {
      const document = toEmailDocument(content);

      if (document) create.mutate({ name, content: document });
    },
  };
};
