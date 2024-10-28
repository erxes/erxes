import * as compose from "lodash.flowright";

import { Alert, getEnv, withProps } from "@erxes/ui/src/utils";
import {
  ChangeStateBulkMutationResponse,
  ChangeStateBulkMutationVariables,
  ChangeStatusMutationResponse,
  ChangeStatusMutationVariables,
  ListQueryVariables,
  MainQueryResponse,
  VerifyMutationResponse,
  VerifyMutationVariables
} from "@erxes/ui-contacts/src/customers/types";
import {
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from "@erxes/ui-contacts/src/customers/types";
import React, { useEffect, useRef, useState } from "react";
import { mutations, queries } from "@erxes/ui-contacts/src/customers/graphql";

import Bulk from "@erxes/ui/src/components/Bulk";
import CustomersList from "../components/list/CustomersList";
import { ListConfigQueryResponse } from "../../companies/types";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  showImportBar: () => void;
  type?: string;
};

type FinalProps = {
  customersMainQuery: MainQueryResponse;
  customersListConfigQuery: ListConfigQueryResponse;
} & Props &
  RemoveMutationResponse &
  MergeMutationResponse &
  VerifyMutationResponse &
  ChangeStatusMutationResponse &
  ChangeStateBulkMutationResponse;

const CustomerListContainer: React.FC<FinalProps> = (props: FinalProps) => {
  let timer;
  const { queryParams } = props;
  const [responseId, setResponseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [mergeCustomerLoading, setMergeCustomerLoading] = useState(false);
  const prevQueryParams = useRef(queryParams);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  useEffect(() => {
    if (queryParams.page !== prevQueryParams.current.page) {
      props.customersMainQuery.refetch();
    }
    prevQueryParams.current = queryParams;
  }, [queryParams.page, props.customersMainQuery]);

  const refetchWithDelay = () => {
    timer = setTimeout(() => {
      props.customersMainQuery.refetch();
    }, 5500);
  };

  const {
    customersMainQuery,
    customersListConfigQuery,
    customersRemove,
    customersMerge,
    customersVerify,
    customersChangeVerificationStatus,
    type,
    customersChangeStateBulk
  } = props;

  let columnsConfig = (customersListConfigQuery &&
    customersListConfigQuery.fieldsDefaultColumnsConfig) || [
    { name: "firstName", label: "First name", order: 1 },
    { name: "lastName", label: "Last name", order: 2 },
    { name: "primaryEmail", label: "Primary email", order: 3 },
    { name: "lastSeenAt", label: "Last seen at", order: 4 },
    { name: "sessionCount", label: "Session count", order: 5 },
    { name: "profileScore", label: "Profile score", order: 6 },
    { name: "middleName", label: "Middle name", order: 7 }
  ];

  // load config from local storage
  const localConfig = localStorage.getItem(`erxes_core:${type}_columns_config`);

  if (localConfig) {
    columnsConfig = JSON.parse(localConfig).filter(conf => {
      return conf && conf.checked;
    });
  }

  const removeCustomers = ({ customerIds }, emptyBulk) => {
    customersRemove({
      variables: { customerIds }
    })
      .then(() => {
        emptyBulk();
        Alert.success(
          "You successfully deleted a customer. The changes will take a few seconds",
          4500
        );

        refetchWithDelay();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const mergeCustomers = ({ ids, data, callback }) => {
    setMergeCustomerLoading(true);

    customersMerge({
      variables: {
        customerIds: ids,
        customerFields: data
      }
    })
      .then((result: any) => {
        callback();
        setMergeCustomerLoading(false);
        Alert.success("You successfully merged a customer");
        navigate(`/contacts/details/${result.data.customersMerge._id}`);
      })
      .catch(e => {
        Alert.error(e.message);
        setMergeCustomerLoading(false);
      });
  };

  const verifyCustomers = ({ verificationType }) => {
    setMergeCustomerLoading(true);

    customersVerify({
      variables: {
        verificationType
      }
    })
      .then(() => {
        Alert.success(
          "Your request has been successfully sent. Your contacts will be verified after a while"
        );
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const changeVerificationStatus = ({
    customerIds,
    verificationType,
    status
  }) => {
    customersChangeVerificationStatus({
      variables: {
        customerIds,
        type: verificationType,
        status
      }
    })
      .then((result: any) => {
        Alert.success("You successfully changed a status");

        customersMainQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const exportData = (bulk: Array<{ _id: string }>) => {
    const { REACT_APP_API_URL } = getEnv();
    const { queryParams } = props;
    const checkedConfigs: any[] = [];

    // queryParams page parameter needs convert to int.
    if (queryParams.page) {
      queryParams.page = parseInt(queryParams.page, 10);
    }

    if (bulk.length > 0) {
      queryParams.ids = bulk.map(customer => customer._id);
    }

    columnsConfig.forEach(checked => {
      checkedConfigs.push(checked.name);
    });

    const exportQuery = {
      ...queryParams,
      type,
      configs: JSON.stringify(checkedConfigs)
    };

    const stringified = queryString.stringify(exportQuery);

    window.open(`${REACT_APP_API_URL}/file-export?${stringified}`, "_blank");
  };

  const changeStateBulk = (_ids: string[], value: string) => {
    customersChangeStateBulk({ variables: { _ids, value } })
      .then(() => {
        Alert.success("Customer state has been changed");
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const searchValue = props.queryParams.searchValue || "";

  const { list = [], totalCount = 0 } = customersMainQuery.customersMain || {};

  const updatedProps = {
    ...props,
    columnsConfig,
    customers: list,
    totalCount,
    exportData,
    searchValue,
    loading: customersMainQuery.loading || loading,
    mergeCustomers,
    responseId,
    removeCustomers,
    verifyCustomers,
    changeVerificationStatus,
    mergeCustomerLoading,
    refetch: refetchWithDelay,
    changeStateBulk
  };

  const content = props => {
    return (
      <CustomersList
        {...updatedProps}
        {...props}
        {...generatePaginationParams(props.queryParams)}
      />
    );
  };

  return <Bulk content={content} refetch={props.customersMainQuery.refetch} />;
};

const generateParams = ({ queryParams, type }) => {
  return {
    ...generatePaginationParams(queryParams),
    segment: queryParams.segment,
    segmentData: queryParams.segmentData,
    tag: queryParams.tag,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    brand: queryParams.brand,
    integration: queryParams.integrationType,
    form: queryParams.form,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    leadStatus: queryParams.leadStatus,
    sortField: queryParams.sortField,
    type,
    dateFilters: queryParams.dateFilters,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  };
};

const getRefetchQueries = (queryParams?: any, type?: string) => {
  return [
    {
      query: gql(queries.customersMain),
      variables: { ...generateParams({ queryParams, type }) }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: "byTag" }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: "byForm" }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: "byIntegrationType" }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: "byLeadStatus" }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: "bySegment" }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: "byBrand" }
    }
  ];
};

const WithProps = withProps<Props>(
  compose(
    graphql<Props & { abortController }, MainQueryResponse, ListQueryVariables>(
      gql(queries.customersMain),
      {
        name: "customersMainQuery",
        options: ({ queryParams, type, abortController }) => ({
          variables: generateParams({ queryParams, type }),
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    ),
    graphql<Props, ListConfigQueryResponse, {}>(
      gql(queries.customersListConfig),
      {
        name: "customersListConfigQuery"
      }
    ),
    // mutations
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.customersRemove),
      {
        name: "customersRemove",
        options: ({ queryParams, type }) => ({
          refetchQueries: getRefetchQueries(queryParams, type)
        })
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.customersMerge),
      {
        name: "customersMerge",
        options: ({ queryParams, type }) => ({
          refetchQueries: getRefetchQueries(queryParams, type)
        })
      }
    ),
    graphql<Props, VerifyMutationResponse, VerifyMutationVariables>(
      gql(mutations.customersVerify),
      {
        name: "customersVerify"
      }
    ),
    graphql<Props, ChangeStatusMutationResponse, ChangeStatusMutationVariables>(
      gql(mutations.customersChangeVerificationStatus),
      {
        name: "customersChangeVerificationStatus"
      }
    ),
    graphql<
      Props,
      ChangeStateBulkMutationResponse,
      ChangeStateBulkMutationVariables
    >(gql(mutations.customersChangeStateBulk), {
      name: "customersChangeStateBulk",
      options: ({ queryParams, type }) => ({
        refetchQueries: getRefetchQueries(queryParams, type)
      })
    })
  )(CustomerListContainer)
);

export default class extends React.Component<Props> {
  private abortController;

  constructor(props) {
    super(props);
    this.abortController = new AbortController();
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  render() {
    const updatedProps = {
      ...this.props,
      abortController: this.abortController
    };

    return <WithProps {...updatedProps} />;
  }
}
