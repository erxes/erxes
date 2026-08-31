import { query } from '@/modules/apollo/apolloClient';
import { readFormEnv } from '@/modules/apollo/utils/env';
import {
  errorMessage,
  formsGate,
  type PortalResult,
} from '@/modules/apollo/utils/result';
import { sanitizePortalHtml } from '@/modules/ui/components/RichText';
import {
  FORM_PORTAL_DETAIL,
  FORM_PORTAL_LIST,
} from './graphql/queries/forms';
import type { FormSummary, PortalForm } from './types';

type ListResponse = { cpForms: { list: FormSummary[] | null } | null };
type DetailResponse = { cpFormDetail: PortalForm | null };

/**
 * `cpForms` accepts a `tagId` but ignores it, so the tag that marks a form as
 * belonging in this portal is applied here instead.
 */
const taggedForPortal = (form: { tagIds: string[] | null }, tagId: string) =>
  (form.tagIds ?? []).includes(tagId);

export const getPortalForms = async (): Promise<PortalResult<FormSummary[]>> => {
  const unconfigured = formsGate<FormSummary[]>();

  if (unconfigured) {
    return unconfigured;
  }

  const { channelId, tagId } = readFormEnv();

  try {
    const { data, error } = await query<ListResponse>({
      query: FORM_PORTAL_LIST,
      variables: { channelId, limit: 50 },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    const forms = (data?.cpForms?.list ?? []).filter((form) =>
      taggedForPortal(form, tagId),
    );

    return { state: 'ready', data: forms };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

export const getPortalForm = async (
  formId: string,
): Promise<PortalResult<PortalForm | null>> => {
  const unconfigured = formsGate<PortalForm | null>();

  if (unconfigured) {
    return unconfigured;
  }

  const { tagId } = readFormEnv();

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

    /* A form reachable by id but never published here stays out of the portal. */
    if (!form || !taggedForPortal(form, tagId)) {
      return { state: 'ready', data: null };
    }

    /*
     * Content blocks are admin-written HTML. They are cleaned here so the
     * client only ever renders markup that has already been through the
     * portal's one sanitiser.
     */
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
