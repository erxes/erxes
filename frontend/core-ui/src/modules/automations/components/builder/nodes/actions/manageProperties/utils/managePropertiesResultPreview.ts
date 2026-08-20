import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

type TManagePropertiesResult = {
  target?: { count?: number; label?: string };
  module?: string;
  changes?: { field: string; fieldLabel?: string }[];
  summary?: string;
  result?: { error?: string }[];
  fields?: string;
};

export const getManagePropertiesSummary = (
  result?: TManagePropertiesResult,
) => {
  if (result?.target && Array.isArray(result?.changes)) {
    const fields = result.changes
      .map((change) => change.fieldLabel || change.field)
      .filter(Boolean)
      .join(', ');
    const target = `${result.target.count} ${result.target.label}`;

    return fields ? `Updated ${target}: ${fields}` : `Updated ${target}`;
  }

  if (typeof result?.summary === 'string') {
    return result.summary;
  }

  const resultList = result?.result || [];
  const errors = resultList.map((item) => item.error || '').join(', ');

  return `Update for ${resultList.length} ${result?.module}: ${
    result?.fields || ''
  }, (${errors})`;
};

export const getManagePropertiesResultPreview: TActionResultPreview = (
  action,
) => getManagePropertiesSummary(action.result);
