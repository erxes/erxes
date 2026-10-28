import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FIELD_TYPES, ILayoutItem, useFields } from 'ui-modules';
import {
  FRONTLINE_TICKET_FIELD_EDIT,
  FRONTLINE_TICKET_SYSTEM_FIELD_EDIT,
} from '@/pipelines/graphql/mutations/ticketFormFieldMutations';
import {
  TICKET_CREATE_LAYOUT_SYSTEM_CODES,
  TICKET_LAYOUT_SYSTEM_LABELS,
  TICKET_PROPERTY_CONTENT_TYPE,
  toLayoutPropertyId,
} from '@/ticket/constants/createLayout';
import { FRONTLINE_TICKET_SYSTEM_FIELD_RULES } from '@/pipelines/graphql/queries/ticketSystemFieldRules';

const PROPERTY_LIMIT = 100;
const RULE_QUERIES = [
  'frontlineTicketSystemFieldRules',
  'PropertiesSystemFieldRules',
  'Fields',
];
const SUPPORTED_TYPES = new Set(FIELD_TYPES.map((type) => type.value));
const TYPE_LABEL = new Map(
  FIELD_TYPES.map((type) => [type.value, type.label]),
);

// System chips are always one of these on the form.
const SYSTEM_KIND: Record<string, string> = {
  priority: 'Select',
  assigneeId: 'Member',
  entityIds: 'Structure',
  startDate: 'Date',
  targetDate: 'Date',
  tagIds: 'Tags',
};

export type TTicketLayoutField = ILayoutItem & {
  kind: 'system' | 'property';
  key: string;
  typeLabel: string;
  createOn: boolean;
  required: boolean;
  // Saved with a type the form cannot render, so it never shows.
  unsupported: boolean;
  // Settings → Properties hides it on the ticket detail; the pipeline can't.
  hiddenInDetail: boolean;
};

// Enough to edit a field's rules, e.g. one created a moment ago.
export type TTicketLayoutFieldRef = Pick<TTicketLayoutField, 'kind' | 'key'>;

/**
 * Every field the ticket create form can hold, with the Settings → Properties
 * rules that decide whether it shows and must be filled, editable in place.
 */
export const useTicketLayoutFields = () => {
  const { t } = useTranslation('frontline');
  const { data: rulesData, loading: rulesLoading } = useQuery(
    FRONTLINE_TICKET_SYSTEM_FIELD_RULES,
    {
      variables: { contentType: TICKET_PROPERTY_CONTENT_TYPE },
      fetchPolicy: 'cache-and-network',
    },
  );
  const { fields, loading: fieldsLoading } = useFields({
    contentType: TICKET_PROPERTY_CONTENT_TYPE,
    limit: PROPERTY_LIMIT,
  });
  const [editSystemField, { loading: savingSystem }] = useMutation(
    FRONTLINE_TICKET_SYSTEM_FIELD_EDIT,
    { refetchQueries: RULE_QUERIES, awaitRefetchQueries: true },
  );
  const [editField, { loading: savingField }] = useMutation(
    FRONTLINE_TICKET_FIELD_EDIT,
    { refetchQueries: RULE_QUERIES, awaitRefetchQueries: true },
  );

  const items = useMemo<TTicketLayoutField[]>(() => {
    const ruleByCode = new Map(
      (rulesData?.propertySystemFields ?? []).map((rule) => [rule.code, rule]),
    );

    return [
      ...TICKET_CREATE_LAYOUT_SYSTEM_CODES.map((code) => {
        const rule = ruleByCode.get(code);
        const createOn = !!rule?.isVisibleToCreate;

        return {
          id: code,
          key: code,
          kind: 'system' as const,
          name: t(
            TICKET_LAYOUT_SYSTEM_LABELS[code].key,
            TICKET_LAYOUT_SYSTEM_LABELS[code].fallback,
          ),
          typeLabel: SYSTEM_KIND[code],
          createOn,
          required: !!rule?.isRequired,
          unsupported: false,
          hiddenInDetail: false,
          dimmed: !createOn,
        };
      }),
      ...fields.map((field) => {
        const unsupported = !SUPPORTED_TYPES.has(field.type);
        const createOn = !!field.isVisibleToCreate;

        return {
          id: toLayoutPropertyId(field._id),
          key: field._id,
          kind: 'property' as const,
          name: field.name,
          typeLabel: TYPE_LABEL.get(field.type) ?? field.type,
          createOn,
          required: !!field.isRequired,
          unsupported,
          hiddenInDetail: field.isVisible === false,
          dimmed: !createOn || unsupported,
        };
      }),
    ];
  }, [fields, rulesData, t]);

  const update = async (
    item: TTicketLayoutFieldRef,
    change: { isVisibleToCreate?: boolean; isRequired?: boolean },
  ) => {
    try {
      if (item.kind === 'system') {
        await editSystemField({
          variables: {
            contentType: TICKET_PROPERTY_CONTENT_TYPE,
            code: item.key,
            ...change,
          },
        });
      } else {
        await editField({ variables: { _id: item.key, ...change } });
      }

      return true;
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });

      return false;
    }
  };

  return {
    items,
    loading: (rulesLoading && !rulesData) || fieldsLoading,
    saving: savingSystem || savingField,
    setCreateOn: (item: TTicketLayoutFieldRef, on: boolean) =>
      update(item, { isVisibleToCreate: on }),
    setRequired: (item: TTicketLayoutFieldRef, required: boolean) =>
      update(item, { isRequired: required }),
  };
};
