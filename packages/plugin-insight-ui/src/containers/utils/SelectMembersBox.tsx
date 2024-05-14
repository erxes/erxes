import { IDashboard, IReport, ReportEditMutationResponse } from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../../graphql";

import Alert from "@erxes/ui/src/utils/Alert/index";
import React from "react";
import SelectMembersBox from "../../components/utils/SelectMembersBox";
import { UsersQueryResponse } from "@erxes/ui/src/auth/types";
import { __ } from "@erxes/ui/src/utils/index";
import { queries as teamQueries } from "@erxes/ui/src/team/graphql";

type Props = {
  targets: IReport[] | IDashboard[];
  type: string;
};

const SelectMembersBoxContainer = (props: Props) => {
  const { targets, type } = props;

  const variables =
    type === "report" ? { reportId: targets[0]._id } : { id: targets[0]._id };

  const usersQuery = useQuery<UsersQueryResponse>(gql(teamQueries.userList), {
    variables: {
      perPage: 20,
      searchValue: "",
    },
  });

  const [reportsEditMutation] = useMutation<ReportEditMutationResponse>(
    gql(mutations[type + "Edit"]),
    {
      refetchQueries: [
        {
          query: gql(queries[type + `Detail`]),
          variables: variables,
        },
      ],
    }
  );

  const updateAssign = (selectedUserIds: string[]) => {
    const charts = (targets[0].charts || []).map((chart) => chart.templateType);

    reportsEditMutation({
      variables: { ...targets[0], charts, assignedUserIds: selectedUserIds },
    })
      .then(() => {
        Alert.success(`Successfully edited ${type}`);
      })
      .catch((err) => Alert.error(err.message));
  };

  const refetch = (searchValue) => {
    usersQuery.refetch({
      searchValue,
    });
  };

  const updatedProps = {
    ...props,
    users: usersQuery?.data?.users || [],
    loading: usersQuery.loading,
    updateAssign,
    refetch,
  };

  return <SelectMembersBox {...updatedProps} />;
};

export default SelectMembersBoxContainer;
