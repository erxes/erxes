import React, { useRef } from 'react';

import debounce from 'lodash/debounce';
import { gql, useQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';
import Button from '@erxes/ui/src/components/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { queries as teamQueries } from '@erxes/ui/src/team/graphql';
import { __ } from '@erxes/ui/src/utils/index';

import SelectMembersBox from '../../components/utils/SelectMembersBox';
import { queries, mutations } from '../../graphql';
import { IDashboard, IReport, ReportEditMutationResponse } from '../../types';

type Props = {
  targets: IReport[] | IDashboard[];
  type: string;
};

const SelectMembersBoxContainer = (props: Props) => {
  const { targets, type } = props;

  const variables =
    type === 'report' ? { reportId: targets[0]._id } : { id: targets[0]._id };

  const usersQuery = useQuery<UsersQueryResponse>(gql(teamQueries.userList), {
    variables: {
      perPage: 20,
      searchValue: '',
    },
  });

  const [reportsEditMutation] = useMutation<ReportEditMutationResponse>(
    gql(mutations[type + 'Edit']),
    {
      refetchQueries: [
        {
          query: gql(queries[type + `Detail`]),
          variables: variables,
        },
      ],
    },
  );

  const updateAssign = (selectedUserIds: string[]) => {
    const charts = targets[0].charts?.map((chart) => chart.templateType);

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
