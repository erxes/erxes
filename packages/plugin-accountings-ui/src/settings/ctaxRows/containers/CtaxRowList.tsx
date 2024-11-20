import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm } from "@erxes/ui/src/utils";
import {
  RemoveCtaxRowMutationResponse,
  CtaxRowsCountQueryResponse,
  CtaxRowsQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import Bulk from "@erxes/ui/src/components/Bulk";
import List from "../components/CtaxRowList";
import React, { useMemo } from 'react';

type Props = {
  queryParams: any;
};

const CtaxRowListContainer = (props: Props) => {

  const {
    queryParams,
  } = props;

  const variables = useMemo(() => {
    return {
      ...queryParams,
      page: Number(queryParams?.page | 1)
    };
  }, [queryParams]);

  const ctaxRowsQuery = useQuery<CtaxRowsQueryResponse>(
    gql(queries.ctaxRows),
    {
      variables: variables
    }
  );

  const ctaxRowsCountQuery = useQuery<CtaxRowsCountQueryResponse>(
    gql(queries.ctaxRowsCount),
    {
      variables: variables
    }
  );

  const refetchQueries = [
    "CtaxRows",
    "CtaxRowsCount",
  ];

  const [removeCtaxRowMutation] = useMutation<RemoveCtaxRowMutationResponse>(
    gql(mutations.ctaxRowsRemove),
    {
      refetchQueries
    }
  );

  const remove = (ctaxRowIds: string[], emptyBulk) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      removeCtaxRowMutation({
        variables: { ctaxRowIds },
      })
        .then(({ data = {} as any }) => {
          emptyBulk();
          ctaxRowsQuery.refetch();

          data?.ctaxRowsRemove === "deleted"
            ? Alert.success("You successfully deleted a CtaxRow")
            : Alert.warning("CtaxRow status deleted");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const ctaxRows = ctaxRowsQuery.data?.ctaxRows || [];
  const ctaxRowsCount = ctaxRowsCountQuery.data?.ctaxRowsCount || 0;

  const updatedProps = {
    ...props,
    queryParams,
    ctaxRows,
    remove,
    loading: ctaxRowsQuery.loading || ctaxRowsCountQuery.loading,
    ctaxRowsCount,
  };

  const CtaxRowList = (params) => {
    return <List {...updatedProps} {...params} />;
  };

  return <Bulk content={CtaxRowList} />;
};

export default CtaxRowListContainer;
