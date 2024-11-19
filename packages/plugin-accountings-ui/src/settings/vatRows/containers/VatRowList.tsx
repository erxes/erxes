import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm } from "@erxes/ui/src/utils";
import {
  RemoveVatRowMutationResponse,
  VatRowsCountQueryResponse,
  VatRowsQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import Bulk from "@erxes/ui/src/components/Bulk";
import List from "../components/VatRowList";
import React, { useMemo } from 'react';

type Props = {
  queryParams: any;
};

const VatRowListContainer = (props: Props) => {

  const {
    queryParams,
  } = props;

  const variables = useMemo(() => {
    return {
      ...queryParams,
      page: Number(queryParams?.page | 1)
    };
  }, [queryParams]);

  const vatRowsQuery = useQuery<VatRowsQueryResponse>(
    gql(queries.vatRows),
    {
      variables: variables
    }
  );

  const vatRowsCountQuery = useQuery<VatRowsCountQueryResponse>(
    gql(queries.vatRowsCount),
    {
      variables: variables
    }
  );

  const refetchQueries = [
    "VatRows",
    "VatRowsCount",
  ];

  const [removeVatRowMutation] = useMutation<RemoveVatRowMutationResponse>(
    gql(mutations.vatRowsRemove),
    {
      refetchQueries
    }
  );
  const remove = (vatRowIds: string[], emptyBulk) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      removeVatRowMutation({
        variables: { vatRowIds },
      })
        .then(({ data = {} as any }) => {
          emptyBulk();
          vatRowsQuery.refetch();

          data?.ctaxRowsRemove === "deleted"
            ? Alert.success("You successfully deleted a VatRow")
            : Alert.warning("VatRow status deleted");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const vatRows = vatRowsQuery.data?.vatRows || [];
  const vatRowsCount = vatRowsCountQuery.data?.vatRowsCount || 0;

  const updatedProps = {
    ...props,
    queryParams,
    vatRows,
    remove,
    loading: vatRowsQuery.loading || vatRowsCountQuery.loading,
    vatRowsCount,
  };

  const VatRowList = (params) => {
    return <List {...updatedProps} {...params} />;
  };

  return <Bulk content={VatRowList} />;
};

export default VatRowListContainer;
