import { useMemo } from 'react';
import {
  FIELD_TYPES,
  IField,
  useFields,
  useSystemFieldRules,
} from 'ui-modules';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import {
  DEFAULT_TICKET_CREATE_LAYOUT,
  TICKET_PROPERTY_CONTENT_TYPE,
  TTicketLayoutSystemCode,
  fromLayoutPropertyId,
  isTicketLayoutSystemCode,
} from '@/ticket/constants/createLayout';

export type TTicketLayoutCell =
  | { kind: 'system'; id: string; code: TTicketLayoutSystemCode }
  | { kind: 'property'; id: string; field: IField };

const PROPERTY_LIMIT = 100;
const SUPPORTED_TYPES = new Set(FIELD_TYPES.map((type) => type.value));

/**
 * The create form rows for a pipeline: its own layout, or the default one.
 * Fields turned off for create in Settings → Properties never show, even when
 * a pipeline placed them.
 */
export const useTicketCreateLayout = (pipelineId?: string) => {
  const { pipeline, loading: pipelineLoading } = useGetPipeline(pipelineId);
  const { rules, loading: rulesLoading } = useSystemFieldRules(
    TICKET_PROPERTY_CONTENT_TYPE,
    'create',
  );
  const { fields, loading: fieldsLoading } = useFields({
    contentType: TICKET_PROPERTY_CONTENT_TYPE,
    limit: PROPERTY_LIMIT,
  });

  const rows = useMemo(() => {
    const fieldById = new Map(fields.map((field) => [field._id, field]));
    const layout = pipeline?.createLayout?.length
      ? pipeline.createLayout
      : DEFAULT_TICKET_CREATE_LAYOUT;

    return layout
      .map((row) =>
        row.flatMap((id): TTicketLayoutCell[] => {
          if (isTicketLayoutSystemCode(id)) {
            return rules.isShown(id) ? [{ kind: 'system', id, code: id }] : [];
          }

          const field = fieldById.get(fromLayoutPropertyId(id) ?? '');

          return field?.isVisibleToCreate && SUPPORTED_TYPES.has(field.type)
            ? [{ kind: 'property', id, field }]
            : [];
        }),
      )
      .filter((row) => row.length);
  }, [pipeline?.createLayout, fields, rules]);

  return {
    rows,
    rules,
    loading: pipelineLoading || rulesLoading || fieldsLoading,
  };
};
