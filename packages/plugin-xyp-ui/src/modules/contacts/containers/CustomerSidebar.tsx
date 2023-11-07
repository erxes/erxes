import React from 'react';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import Alert from '@erxes/ui/src/utils/Alert';
import CustomerSidebar from '../components/CustomerSidebar';
import { mutations, queries } from '../graphql';
import { IOperation } from '../types';

type Props = {
  id: string;
  mainType: string;
};
const getContentType = mainType => {
  if (mainType === 'customer') return 'contacts:customer';
  if (mainType.includes(':')) return mainType;
  return `default:${mainType}`;
};
const CustomerSidebarContainer = (props: Props) => {
  const contentType = getContentType(props.mainType);
  const detail = useQuery(gql(queries.detail), {
    variables: {
      contentTypeId: props.id,
      contentType
    },
    fetchPolicy: 'network-only'
  });

  const serviceChoosen = useQuery(gql(queries.serviceChoosen), {
    fetchPolicy: 'network-only'
  });

  const xypServiceList = useQuery(gql(queries.xypServiceList), {});
  const [xypRequest] = useLazyQuery(gql(queries.xypRequest), {
    fetchPolicy: 'network-only'
  });

  const [add] = useMutation(gql(mutations.add));
  const [edit] = useMutation(gql(mutations.edit));

  const fetchData = (operation: IOperation, params: any) => {
    xypRequest({
      variables: {
        wsOperationName: operation.wsOperationName,
        params
      }
    }).then(({ data }) => {
      if (data?.xypRequest?.return?.resultCode === 0) {
        const xypData = [
          {
            serviceName: operation.wsOperationName,
            serviceDescription: operation.wsOperationDetail,
            data: data?.xypRequest?.return?.response
          }
        ];
        if (!detail?.data?.xypDataDetail) {
          add({
            variables: {
              contentType,
              contentTypeId: props.id,
              data: xypData
            }
          }).then(({ data }) => {
            detail.refetch();
            if (data.xypDataAdd?._id) {
              Alert.success('Successfully added an item');
            } else {
              Alert.error('error');
            }
          });
        } else {
          const unique = detail?.data?.xypDataDetail.data.filter(
            d => d.serviceName !== operation.wsOperationName
          );
          edit({
            variables: {
              _id: detail?.data?.xypDataDetail._id,
              contentType,
              contentTypeId: props.id,
              data: [...unique, ...xypData]
            }
          }).then(({ data }) => {
            detail.refetch();
            if (data.xypDataUpdate?._id) {
              Alert.success('Successfully edited an item');
            } else {
              Alert.error('error');
            }
          });
        }
      } else {
        Alert.error(`${data?.xypRequest?.return?.resultMessage}`);
      }
    });
  };

  if (detail.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    xypdata: detail?.data?.xypDataDetail,
    loading: detail.loading || xypServiceList.loading,
    error: xypServiceList?.error?.name || '',
    refetch: detail.refetch,
    xypServiceList: xypServiceList?.data?.xypServiceList || [],
    serviceChoosenLoading: serviceChoosen.loading,
    list: serviceChoosen?.data?.xypServiceListChoosen,
    fetchData
  };

  return <CustomerSidebar {...updatedProps} />;
};

export default CustomerSidebarContainer;
