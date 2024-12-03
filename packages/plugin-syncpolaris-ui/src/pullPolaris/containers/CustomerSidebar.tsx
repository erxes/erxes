import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Spinner } from "@erxes/ui/src";
import React from "react";
import PullPolarisCustomer from "../components/CustomerSidebar";
import { queries } from "../graphql";
import { PullPolarisConfigsQueryResponse, PullPolarisQueryResponse } from "../types";

type Props = {
  mainType?: string;
  id?: string;
  closeModal: () => void;
  reportPurpose: string;
  keyword?: string;
};

export default function PullPolarisCustomerContainer(props: Props) {
  const { id } = props;

  const configsQuery = useQuery<PullPolarisConfigsQueryResponse>(
    gql(queries.pullPolarisConfigs),
    {
      variables: {
        contentType: 'customer'
      },
      fetchPolicy: "network-only",
    }
  );

  const [loadPullPolarisQuery, loadPullDataResponse] = useLazyQuery<PullPolarisQueryResponse>(
    gql(queries.pullPolarisData)
  );

  if (configsQuery.loading) {
    return <Spinner />
  }

  if (configsQuery.error) {
    return <>Pull Polaris: {configsQuery.error.message}</>
  }

  const configs = configsQuery.data?.pullPolarisConfigs || [];
  const loadConfigs = configs.filter(c => c.kind === 'load')
  const clickConfigs = configs.filter(c => c.kind === 'click')

  const getLoadPullData = () => {
    loadPullPolarisQuery({
      variables: {
        contentType: 'customer',
        kind: 'load',
        contentId: id,
        codes: (loadConfigs || []).map(lc => lc.code)
      }
    });
  };

  const loadPullData = loadPullDataResponse.data?.pullPolarisData;
  const loadDataLoading = loadPullDataResponse.loading;

  const updatedProps = {
    ...props,
    configs,
    getLoadPullData,
    loadPullData,
    loadDataLoading,
    clickConfigs,
    customerId: id || '',
  };

  return <PullPolarisCustomer {...updatedProps} />;
}
