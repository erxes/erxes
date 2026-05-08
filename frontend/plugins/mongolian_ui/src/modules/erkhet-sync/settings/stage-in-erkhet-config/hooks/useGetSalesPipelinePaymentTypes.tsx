import { useQuery } from '@apollo/client';
import { GET_SALES_PIPELINE_DETAIL } from '../graphql/queries/salesPipelineDetail';

export type TPaymentType = {
  _id: string;
  title: string;
  type: string;
};

export const useGetSalesPipelinePaymentTypes = (pipelineId: string) => {
  const { data, loading } = useQuery(GET_SALES_PIPELINE_DETAIL, {
    variables: { _id: pipelineId },
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
  });

  const paymentTypes: TPaymentType[] = data?.salesPipelineDetail?.paymentTypes || [];

  return { paymentTypes, loading };
};
