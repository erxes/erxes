import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Spinner from "@erxes/ui/src/components/Spinner";
import Alert from "@erxes/ui/src/utils/Alert";
import React from "react";
import CustomerSidebar from "../components/CustomerSidebar";
import { mutations, queries } from "../graphql";
import { IOperation } from "../types";

type Props = {
  id: string;
  mainType: string;
};

const getContentType = (mainType) => {
  if (mainType === "customer") return "core:customer";
  if (mainType.includes(":")) return mainType;
  return `default:${mainType}`;
};

const CustomerSidebarContainer = (props: Props) => {
  const contentType = getContentType(props.mainType);
  const xypDatasQuery = useQuery(gql(queries.xypDataByObject), {
    variables: {
      contentTypeId: props.id,
      contentType
    },
    fetchPolicy: "network-only"
  });

  const xypDatas = xypDatasQuery.data?.xypDataByObject || [];

  const serviceChoosen = useQuery(gql(queries.serviceChoosen), {
    fetchPolicy: "network-only"
  });

  const xypServiceList = useQuery(gql(queries.xypServiceList), {});

  const [xypRequest] = useLazyQuery(gql(queries.xypRequest), {
    fetchPolicy: "network-only"
  });

  const [add] = useMutation(gql(mutations.add));

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

        add({
          variables: {
            contentType,
            contentTypeId: props.id,
            data: xypData,
          },
        }).then(({ data }) => {
          xypDatasQuery.refetch();
          if (data.xypDataAdd?._id) {
            Alert.success("Successfully added an item");
          } else {
            Alert.error("error");
          }
        });

      } else {
        Alert.error(`${data?.xypRequest?.return?.resultMessage}`);
      }
    });
  };

  if (xypDatasQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    xypDatas,
    loading: serviceChoosen.loading || xypServiceList.loading,
    error: xypServiceList?.error?.name || "",
    xypServiceList: xypServiceList?.data?.xypServiceList || [],
    serviceChoosenLoading: serviceChoosen.loading,
    list: serviceChoosen?.data?.xypServiceListChoosen,
    fetchData,
  };

  return <CustomerSidebar {...updatedProps} />;
};

export default CustomerSidebarContainer;
