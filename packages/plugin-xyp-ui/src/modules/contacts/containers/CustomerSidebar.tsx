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
const CustomerSidebarContainer = (props: Props) => {
  const detail = useQuery(gql(queries.detail), {
    variables: { contentTypeId: props.id, contentType: props.mainType },
    fetchPolicy: 'network-only'
  });

  const customer = useQuery(gql(queries.customerDetail), {
    variables: { _id: props.id, contentType: props.mainType }
  });

  const serviceChoosen = useQuery(gql(queries.serviceChoosen), {
    fetchPolicy: 'network-only'
  });
  const fieldsGroups = useQuery(gql(queries.fieldsGroups), {
    variables: { contentType: 'contacts:customer' }
  });
  const xypServiceList = useQuery(gql(queries.xypServiceList), {});
  const [xypRequest] = useLazyQuery(gql(queries.xypRequest), {
    fetchPolicy: 'network-only'
  });

  const [add] = useMutation(gql(mutations.add));
  const [edit] = useMutation(gql(mutations.edit));
  const [customerEdit] = useMutation(gql(mutations.customerEdit));

  const fetchData = (operation: IOperation, params: any, paramsOutput: any) => {
    // params = regnum : "LRg7bBkPh3znA3Ecz"
    // key = xyp систем рүү service дуудах фараметрийн нэр // etc regnum
    // value = fieldsGroup field string id бөгөөд fieldsgroupээс шүүж, contacts-ын фиэлд нэрийг олно,
    const _in: any[] = [];
    for (const [key, value] of Object.entries(params)) {
      let field = null as any;
      for (const d of fieldsGroups.data?.fieldsGroups) {
        field = d?.fields?.find(x => value === x._id);
        if (field) break;
      }
      if (field) {
        // key нь хур луу явуулах фиэлд утга
        _in.push({ field: field, key: key });
      }
    }

    const _out: any[] = [];

    for (const [key, value] of Object.entries(paramsOutput)) {
      let field = null as any;
      for (const d of fieldsGroups.data?.fieldsGroups) {
        field = d?.fields?.find(x => value === x._id);
        if (field) break;
      }
      if (field) {
        // key нь хураас ирж байгаа фиэлд утга
        _out.push({ field: field, key: key });
      }
    }
    // generate Params
    let xypParams = {};
    for (const d of _in) {
      if (d.field?.isDefinedByErxes)
        xypParams[d.key] = customer.data?.customerDetail[d.field.type];
      else {
        xypParams[d.key] = customer.data?.customerDetail?.customFieldsData.find(
          x => x.field === d.field._id
        ).stringValue;
      }
    }

    const editCustomFieldsData = customer.data?.customerDetail?.customFieldsData.map(
      d => ({
        field: d.field,
        value: d.value
      })
    );

    xypRequest({
      variables: {
        wsOperationName: operation.wsOperationName,
        params: xypParams
      }
    }).then(({ data }) => {
      if (data?.xypRequest?.return?.resultCode === 0) {
        const response = data?.xypRequest?.return?.response;
        const editCustomerParams = {};
        const customFieldsData: any[] = [];
        let filtered = editCustomFieldsData;
        for (const d of _out) {
          if (d.key in response) {
            if (d.field.isDefinedByErxes) {
              editCustomerParams[d.field.type] = response[d.key];
            } else {
              filtered = filtered.filter(
                customeField => customeField.field !== d.field._id
              );
              customFieldsData.push({
                field: d.field._id,
                value: response[d.key]
              });
            }
          }
        }

        // customerEdit({
        //   variables: {
        //     customFieldsData: [...customFieldsData, ...filtered],
        //     _id: props.id,
        //     ...editCustomerParams,
        //   },
        // })
        //   .then(({ data }) => {})
        //   .catch((e) => console.log(e));
        let list: { field: string; value: any }[] = [];

        for (const [key, value] of Object.entries(
          data?.xypRequest?.return?.response
        )) {
          const obj = { field: key, value: value };
          list.push(obj);
        }

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
              contentType: props.mainType,
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
            d => d.serviceName != operation.wsOperationName
          );
          edit({
            variables: {
              _id: detail?.data?.xypDataDetail._id,
              contentType: props.mainType,
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
    customer: customer.data?.customerDetail,
    loading: detail.loading || xypServiceList.loading,
    error: xypServiceList?.error?.name || '',
    refetch: detail.refetch,
    fieldsGroups: fieldsGroups,
    xypServiceList: xypServiceList?.data?.xypServiceList || [],
    serviceChoosenLoading: serviceChoosen.loading,
    list: serviceChoosen?.data?.xypServiceListChoosen,
    fetchData: fetchData
  };

  return <CustomerSidebar {...updatedProps} />;
};

export default CustomerSidebarContainer;
