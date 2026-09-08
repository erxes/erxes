import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TPropertyType } from './useSegmentPropertyTypes';
import { TSegmentField, TSegmentOperator } from '../types';

const namespaceOf = (contentType?: string): string => {
  const pluginName = (contentType || '').split(':')[0];

  return !pluginName || pluginName === 'core' ? 'segment' : pluginName;
};

const requested = new Set<string>();

const asKey = (id: string): string => id.replace(/[:.]/g, '-');

export const useSegmentLabels = () => {
  const { t, i18n } = useTranslation();
  const [, arrived] = useState(0);

  const namespaceFor = (contentType?: string): string => {
    const ns = namespaceOf(contentType);

    if (!requested.has(ns) && !i18n.hasLoadedNamespace(ns)) {
      requested.add(ns);

      i18n
        .loadNamespaces(ns)
        .then(() => arrived((count) => count + 1))
        .catch(() => {
          // A namespace that will not load falls back to the declared label.
        });
    }

    return ns;
  };

  const fieldLabel = (contentType: string | undefined, field: TSegmentField) =>
    t(`${namespaceFor(contentType)}:field.${field.key}`, {
      defaultValue: field.label,
    });

  const operatorLabel = (operator: TSegmentOperator) =>
    t(`segment:operator.${operator.value}`, { defaultValue: operator.label });

  const typeLabel = (type: TPropertyType) =>
    t(
      `${namespaceFor(type.contentType)}:${
        type.relationKey
          ? `relation.${asKey(type.relationKey)}`
          : `content-type.${asKey(type.contentType)}`
      }`,
      { defaultValue: type.label },
    );

  const contentTypeLabel = (contentType: string, label: string) =>
    t(`${namespaceFor(contentType)}:content-type.${asKey(contentType)}`, {
      defaultValue: label,
    });

  const operatorHint = (operator?: TSegmentOperator): string | null => {
    if (!operator) {
      return null;
    }

    const translated = t(`segment:operator-hint.${operator.value}`, {
      defaultValue: operator.hint || '',
    });

    return translated || null;
  };

  return {
    fieldLabel,
    operatorLabel,
    operatorHint,
    typeLabel,
    contentTypeLabel,
  };
};
