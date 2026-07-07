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

  const pipeline = data?.salesPipelineDetail;
  const pipelinePaymentTypes: TPaymentType[] = pipeline?.paymentTypes || [];
  const otherPaymentTypes = pipelinePaymentTypes.filter(
    (paymentType) => !['cash', 'bank'].includes(paymentType.type),
  );
  const paymentTypes: TPaymentType[] = [
    { _id: 'cash', title: 'Бэлнээр', type: 'cash' },
    ...((pipeline?.paymentIds || []).length
      ? [{ _id: 'mobile', title: 'Цахимаар', type: 'mobile' }]
      : []),
    ...otherPaymentTypes,
  ];

  return { paymentTypes, loading };
};
