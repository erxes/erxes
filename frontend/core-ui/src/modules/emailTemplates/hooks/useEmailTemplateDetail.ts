import { useLazyQuery, useQuery } from '@apollo/client';
import { EMAIL_TEMPLATE_DETAIL } from '@/emailTemplates/graphql/queries';
import { IEmailTemplate } from '@/emailTemplates/types';

type TDetailResponse = { emailTemplateDetail: IEmailTemplate };

export const useEmailTemplateDetail = (id?: string) => {
  const { data, loading, error } = useQuery<TDetailResponse>(
    EMAIL_TEMPLATE_DETAIL,
    { variables: { id }, skip: !id, fetchPolicy: 'cache-and-network' },
  );

  return { emailTemplate: data?.emailTemplateDetail, loading, error };
};

/** Used where a template is only read once someone picks it. */
export const useEmailTemplateDetailLazy = () => {
  const [load, { data, loading, error }] = useLazyQuery<TDetailResponse>(
    EMAIL_TEMPLATE_DETAIL,
    { fetchPolicy: 'cache-and-network' },
  );

  return {
    loadEmailTemplate: (id: string) => load({ variables: { id } }),
    emailTemplate: data?.emailTemplateDetail,
    loading,
    error,
  };
};
