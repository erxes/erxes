import { ButtonMutate, Spinner, __ } from "@erxes/ui/src";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import { mutations, queries } from "../graphql";
import { PullPolarisConfigsQueryResponse, PullPolarisQueryResponse } from "../types";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import PullPolarisCustomer from "../components/CustomerSidebar";

type Props = {
  mainType?: string;
  id?: string;
  closeModal: () => void;
  reportPurpose: string;
  keyword?: string;
};

export default function PullPolarisCustomerContainer(props: Props) {
  const { id } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal } = props;
    const afterSave = () => {
      closeModal();
    };
    values.customerId = id;
    return (<></>
      // <ButtonMutate
      //   icon="loading"
      //   mutation={mutations.toCheckScoring}
      //   variables={values}
      //   callback={afterSave}
      //   refetchQueries={refetch()}
      //   isSubmitted={isSubmitted}
      //   type="submit"
      //   uppercase={false}
      //   successMessage={__(`You successfully score a ${name}`)}
      // >
      //   {" "}
      //   {__("Scoring")}
      // </ButtonMutate>
    );
  };

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

  const refetch = () => {
    return ["burenCustomerScoringsMain", "getCustomerScore"];
  };

  const updatedProps = {
    ...props,
    configs,
    renderButton,
    getLoadPullData,
    loadPullData,
    loadDataLoading,
    customerId: id || '',
  };

  return <PullPolarisCustomer {...updatedProps} />;
}
