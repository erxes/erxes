import { query } from '@/modules/apollo/apolloClient';
import {
  createSharedCache,
  TIMED_OUT,
} from '@/modules/apollo/utils/sharedCache';
import { getPortalConfig } from '@/modules/config/api';
import { readScopedApiUrl } from '@/modules/config/requestScope';
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
    .filter((form): form is FormSummary => Boolean(form));
};

const isPublishedForm = (form: PortalForm, config: PortalConfig): boolean =>
  Boolean(config.formChannelId) &&
  form.channelId === config.formChannelId &&
  form.status === 'active' &&
  (!config.formIds.length || config.formIds.includes(form._id));

const keepReady = <T>(result: PortalResult<T>): boolean =>
  result.state === 'ready';

const sharedList = createSharedCache<PortalResult<FormSummary[]>>({
  ttlMs: 60_000,
  staleMs: 10 * 60_000,
  maxEntries: 500,
  keep: keepReady,
  timedOut: () => ({ state: 'error', message: TIMED_OUT }),
});

const sharedDetail = createSharedCache<PortalResult<PortalForm | null>>({
  ttlMs: 60_000,
  staleMs: 10 * 60_000,
  maxEntries: 2_000,
  keep: keepReady,
  timedOut: () => ({ state: 'error', message: TIMED_OUT }),
});

const loadFormList = async (
  channelId: string,
): Promise<PortalResult<FormSummary[]>> => {
  try {
    const { data, error } = await query<ListResponse>({
      query: FORM_PORTAL_LIST,
      variables: { channelId, limit: FORM_LIST_LIMIT },
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

const loadForm = async (
  formId: string,
): Promise<PortalResult<PortalForm | null>> => {
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

  const list = await sharedList(
    [readScopedApiUrl(), config.data.appToken, formChannelId].join('|'),
    () => loadFormList(formChannelId),
  );

  if (list.state !== 'ready') {
    return list;
  }

  return { state: 'ready', data: pickPublishedForms(list.data, formIds) };
};

export const getPortalForm = async (
  formId: string,
): Promise<PortalResult<PortalForm | null>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  const form = await sharedDetail(
    [readScopedApiUrl(), config.data.appToken, formId].join('|'),
    () => loadForm(formId),
  );

  if (form.state !== 'ready') {
    return form;
  }

  if (!form.data || !isPublishedForm(form.data, config.data)) {
    return { state: 'ready', data: null };
  }

  return form;
};
