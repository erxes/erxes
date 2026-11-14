import { REFERENCE_PATTERN } from '@erxes/core-contract';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orpc } from '~/lib/api';

const handlesIn = (content: string) => [
  ...new Set(Array.from(content.matchAll(REFERENCE_PATTERN), ([, handle]) => handle ?? '')),
];

export const useReferenceLabels = (content: string) => {
  const { t } = useTranslation('assistant');
  const handles = handlesIn(content).filter(Boolean);

  const results = useQueries({
    queries: handles.map((handle) => orpc.assistant.reference.queryOptions({ input: { handle } })),
  });

  const labels = new Map(
    handles.map((handle, index) => {
      const record = results[index]?.data;

      return [handle, record?.available ? record.label : t('reference.unavailable', 'Unavailable')];
    }),
  );

  return (text: string, escape: (label: string) => string = (label) => label) =>
    text.replace(REFERENCE_PATTERN, (_token, handle: string) => escape(labels.get(handle) ?? ''));
};
