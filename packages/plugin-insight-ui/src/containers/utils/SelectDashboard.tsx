import React from 'react';

import { gql, useQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';

import SelectDashboard from '../../components/utils/SelectDashboard';
import { IReport, IGoalType, SectionsListQueryResponse } from '../../types';
import { queries, mutations } from '../../graphql';

type Props = {
  queryParams: any;
  history: any;
  data: IReport | IGoalType;
};

const SelectDashboardContainer = (props: Props) => {
  const { queryParams, history, data } = props;

  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: { type: 'dashboard' },
    },
  );

  const [dashboardAddToMutation] = useMutation(gql(mutations.dashboardAddTo), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: 'dashboard' },
      },
      {
        query: gql(queries.dashboardList),
      },
    ],
  });

  const handleMutation = (id: string) => {
    dashboardAddToMutation({
      variables: {
        ...data,
        sectionId: id,
      },
    })
      .then((res) => {
        Alert.success('Successfully created dashboard');
        const { _id } = res.data.dashboardAddTo;
        if (_id) {
          history.push(`/insight?dashboardId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const sections = sectionsQuery?.data?.sections || [];

  const updatedProps = {
    ...props,
    sections,
    handleMutation,
  };

  return <SelectDashboard {...updatedProps} />;
};

export default SelectDashboardContainer;
