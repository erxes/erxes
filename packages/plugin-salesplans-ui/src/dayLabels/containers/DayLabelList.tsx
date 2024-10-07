import { gql, useQuery, useMutation } from "@apollo/client";
import React from "react";
import DayLabels from "../components/DayLabelList";
import { Alert, router } from "@erxes/ui/src/utils";
import { Bulk } from "@erxes/ui/src/components";
import { mutations, queries } from "../graphql";
import {
  DayLabelsQueryResponse,
  DayLabelsRemoveMutationResponse,
  DayLabelsCountQueryResponse,
} from "../types";

type Props = {
  queryParams: any;
  type?: string;
};

const DayLabelList = (props: Props) => {
  const { queryParams } = props;

  const dayLabelQuery = useQuery<DayLabelsQueryResponse>(
    gql(queries.dayLabels),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const dayLabelsCountQuery = useQuery<DayLabelsCountQueryResponse>(
    gql(queries.dayLabelsCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const [dayLabelsRemove] = useMutation<DayLabelsRemoveMutationResponse>(
    gql(mutations.dayLabelsRemove),
    {
      refetchQueries: ["dayLabels", "dayLabelsCount"],
    }
  );

  // // edit row action
  // const edit = (doc: IDayLabel) => {
  //   dayLabelEdit({
  //     variables: { ...doc }
  //   })
  //     .then(() => {
  //       Alert.success('You successfully updated a labels');
  //       dayLabelQuery.refetch();
  //     })
  //     .catch(e => {
  //       Alert.error(e.message);
  //     });
  // };

  // remove action
  const remove = ({ dayLabelIds }, emptyBulk) => {
    dayLabelsRemove({
      variables: { _ids: dayLabelIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a day label");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const dayLabels = dayLabelQuery?.data?.dayLabels || [];
  const totalCount = dayLabelsCountQuery?.data?.dayLabelsCount || 0;
  const loading = dayLabelQuery.loading || dayLabelsCountQuery.loading;

  const updatedProps = {
    ...props,
    queryParams,
    dayLabels,
    totalCount,
    loading,
    // edit,
    remove,
  };

  const dayLabelList = (bulkProps) => (
    <DayLabels {...updatedProps} {...bulkProps} />
  );

  const refetch = () => {
    dayLabelQuery.refetch();
    dayLabelsCountQuery.refetch();
  };

  return <Bulk content={dayLabelList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  _ids: queryParams._ids,
  date: queryParams.date,
  filterStatus: queryParams.filterStatus,
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  labelId: queryParams.labelId,
  dateType: queryParams.dateType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
});

export default DayLabelList;
