import { query } from '@/modules/apollo/apolloClient';
import { getPortalConfig } from '@/modules/config/api';
import { errorMessage, type PortalResult } from '@/modules/apollo/utils/result';
import { sanitizePortalHtml } from '@/modules/ui/components/RichText';
import { FORM_PORTAL_DETAIL, FORM_PORTAL_LIST } from './graphql/queries/forms';
import type { FormSummary, PortalForm } from './types';

type ListResponse = { cpForms: { list: FormSummary[] | null } | null };
type DetailResponse = { cpFormDetail: PortalForm | null };

export const getPortalForms = async (): Promise<
  PortalResult<FormSummary[]>
> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  const channelId = config.data.ticketChannelId;

  if (!channelId) {
    return { state: 'ready', data: [] };
  }

  try {
    const { data, error } = await query<ListResponse>({
      query: FORM_PORTAL_LIST,
      variables: { channelId, limit: 50 },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    return { state: 'ready', data: data?.cpForms?.list ?? [] };
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

    if (!form) {
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
