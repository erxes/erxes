import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import Alert from "@erxes/ui/src/utils/Alert";
import CustomerSidebar from "../components/CustomerSidebar";
import { IOperation } from "../types";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";

type Props = {
  id: string;
  mainType: string;
  showType?: string;
};

const getContentType = (mainType) => {
  if (mainType === "customer") return "core:customer";
  if (mainType === "deal") return "sales:deal";
  if (mainType.includes(":")) return mainType;
  return `default:${mainType}`;
};

const CustomerSidebarContainer = (props: Props) => {
  const contentType = getContentType(props.mainType);
  const xypDatasQuery = useQuery(gql(queries.xypDataByObject), {
    variables: {
      contentTypeId: props.id,
      contentType,
    },
    fetchPolicy: "network-only",
  });

  const xypDatas = xypDatasQuery.data?.xypDataByObject || [];

  const serviceChoosen = useQuery(gql(queries.serviceChoosen), {
    fetchPolicy: "network-only",
  });

  const xypServiceList = useQuery(gql(queries.xypServiceList), {});

  const [xypRequest] = useLazyQuery(gql(queries.xypRequest), {
    fetchPolicy: "network-only",
  });

  const [add] = useMutation(gql(mutations.add));

  const fetchData = (operation: IOperation, params: any) => {
    xypRequest({
      variables: {
        wsOperationName: operation.wsOperationName,
        params,
      },
    }).then(({ data }) => {
      if (data?.xypRequest?.return?.resultCode === 0) {
        const xypData = [
          {
            serviceName: operation.wsOperationName,
            serviceDescription: operation.wsOperationDetail,
            data: data?.xypRequest?.return?.response,
          },
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
    showType: props.showType,
  };

  return <CustomerSidebar {...updatedProps} />;
};

export default CustomerSidebarContainer;
