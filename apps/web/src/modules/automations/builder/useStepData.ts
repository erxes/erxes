import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { type FieldInfo, useAutomationFields } from './useAutomationFields';

export type StepData = FieldInfo & { parent?: string };

type Reference = NonNullable<FieldInfo['refersTo']> | 'user';

type Child = { key: string; label: string; type: FieldInfo['type'] };

const referenceOf = (field: FieldInfo): Reference | undefined =>
  field.refersTo ?? (field.type === 'member' ? 'user' : undefined);

const ownFields = (fields: FieldInfo[]): Child[] =>
  fields
    .filter(
      (field) => field.path.startsWith('subject.') && !field.conditionsOnly && !field.relation,
    )
    .map((field) => ({
      key: field.path.slice('subject.'.length),
      label: field.label,
      type: field.type,
    }));

const useChildren = (automationId: string): Record<Reference, Child[]> => {
  const { t } = useTranslation('automations');
  const customer = useAutomationFields('customer', automationId).fields;
  const company = useAutomationFields('company', automationId).fields;

  return {
    customer: ownFields(customer),
    company: ownFields(company),
    user: [
      { key: 'fullName', label: t('member-name', 'Name'), type: 'text' },
      { key: 'email', label: t('member-email', 'Email'), type: 'text' },
    ],
    product: [
      { key: 'name', label: t('product-name', 'Name'), type: 'text' },
      { key: 'code', label: t('product-code', 'Code'), type: 'text' },
      { key: 'price', label: t('product-price', 'Price'), type: 'number' },
      { key: 'unit', label: t('product-unit', 'Unit'), type: 'text' },
    ],
  };
};

export const useStepData = (stepId: string, subject: 'customer' | 'company'): StepData[] => {
  const { hasSubject, automationId, outputsBefore } = useContext(BuilderContext);
  const { fields } = useAutomationFields(subject, automationId);
  const children = useChildren(automationId);

  const own: FieldInfo[] = hasSubject
    ? fields
    : fields.filter((field) => field.path.startsWith('event.payload.'));

  return [...own, ...outputsBefore(stepId)].flatMap((field) => {
    const reference = referenceOf(field);

    return [
      field,
      ...(reference ? children[reference] : []).map((child) => ({
        path: `${field.path}->${reference}.${child.key}`,
        label: `${field.label} · ${child.label}`,
        type: child.type,
        parent: field.path,
      })),
    ];
  });
};
