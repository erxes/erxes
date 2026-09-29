import { query } from '@/modules/apollo/apolloClient';
import { getPortalConfig } from '@/modules/config/api';
import type { PortalConfig } from '@/modules/config/types';
import { errorMessage, type PortalResult } from '@/modules/apollo/utils/result';
import { sanitizePortalHtml } from '@/modules/ui/components/RichText';
import { FORM_PORTAL_DETAIL, FORM_PORTAL_LIST } from './graphql/queries/forms';
import type { FormSummary, PortalForm } from './types';

type ListResponse = { cpForms: { list: FormSummary[] | null } | null };
type DetailResponse = { cpFormDetail: PortalForm | null };

const FORM_LIST_LIMIT = 100;

const pickPublishedForms = (
  forms: FormSummary[],
  formIds: string[],
): FormSummary[] => {
  if (!formIds.length) {
    return forms;
  }

  return formIds
    .map((formId) => forms.find((form) => form._id === formId))
    .filter((form): form is FormSummary => !!form);
};

const isPublishedForm = (form: PortalForm, config: PortalConfig): boolean =>
  !!config.formChannelId &&
  form.channelId === config.formChannelId &&
  form.status === 'active' &&
  (!config.formIds.length || config.formIds.includes(form._id));

export const getPortalForms = async (): Promise<
  PortalResult<FormSummary[]>
> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  const { formChannelId, formIds } = config.data;

  if (!formChannelId) {
    return { state: 'ready', data: [] };
  }

  try {
    const { data, error } = await query<ListResponse>({
      query: FORM_PORTAL_LIST,
      variables: { channelId: formChannelId, limit: FORM_LIST_LIMIT },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    return {
      state: 'ready',
      data: pickPublishedForms(data?.cpForms?.list ?? [], formIds),
    };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

export const getPortalForm = async (
  formId: string,
): Promise<PortalResult<PortalForm | null>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  try {
    const { data, error } = await query<DetailResponse>({
      query: FORM_PORTAL_DETAIL,
      variables: { _id: formId },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    const form = data?.cpFormDetail ?? null;

    if (!form || !isPublishedForm(form, config.data)) {
      return { state: 'ready', data: null };
    }

    return {
      state: 'ready',
      data: {
        ...form,
        fields: (form.fields ?? []).map((field) => ({
          ...field,
          content: field.content ? sanitizePortalHtml(field.content) : null,
        })),
      },
    };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};
