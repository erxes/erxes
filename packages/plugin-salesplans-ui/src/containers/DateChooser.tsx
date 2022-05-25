import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { useQuery, useMutation, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import DateChooser from '../components/DateChooser';
import { Alert } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';

type Props = {
  data: any;
  closeModal: () => void;
};

type FinalProps = {} & Props & {
    labelsQuery: any;
  };

function DateChooserContainer({ data, closeModal, labelsQuery }: FinalProps) {
  const type = data.type;
  const day = data.date;

  const labelsQuerys = useQuery(gql(queries.getLabels), {
    variables: { type }
  });

  const dayConfigQuery = useQuery(gql(queries.getTimeframes), {
    skip: type !== 'Day',
    fetchPolicy: 'network-only'
  });

  const dayplanconfs = useQuery(gql(queries.getDayPlanConfig), {
    variables: { salesLogId: data._id },
    fetchPolicy: 'network-only',
    skip: type !== 'Day'
  });

  const monthplanconfs = useQuery(gql(queries.getMonthPlanConfig), {
    variables: { salesLogId: data._id },
    skip: type !== 'Month'
  });

  const yearplanconfs = useQuery(gql(queries.getYearPlanConfig), {
    variables: { salesLogId: data._id },
    skip: type !== 'Year'
  });

  const [saveDayPlan] = useMutation(gql(mutations.saveDayPlanConfig));

  const [saveMonthPlan] = useMutation(gql(mutations.saveMonthPlanConfig));

  const [saveYearPlan] = useMutation(gql(mutations.saveYearPlanConfig));

  const saveData = (salesLogId, data) => {
    if (type === 'Day') {
      saveDayPlan({ variables: { salesLogId, data } })
        .then(() => {
          Alert.success('Timeframes of an day saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    if (type === 'Month') {
      saveMonthPlan({ variables: { salesLogId, data } })
        .then(() => {
          Alert.success('Days of a month Successfully saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    if (type === 'Year') {
      saveYearPlan({ variables: { salesLogId, day, data } })
        .then(() => {
          Alert.success('Months of a year Successfully saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    closeModal();
  };

  let configs;

  if (type === 'Day')
    configs = dayplanconfs.data ? dayplanconfs.data.getDayPlanConfig : null;
  else if (type === 'Month')
    configs = monthplanconfs.data
      ? monthplanconfs.data.getMonthPlanConfig
      : null;
  else
    configs = yearplanconfs.data ? yearplanconfs.data.getYearPlanConfig : null;

  // console.log(
  //   "container configs",
  //   data._id,
  //   yearplanconfs.data ? yearplanconfs.data.getYearPlanConfig : null
  // );
  console.log(
    'laaaabel',
    labelsQuery.data ? labelsQuery.data.getLabels : [],
    labelsQuerys.data ? labelsQuerys.data.getLabels : []
  );
  return (
    <DateChooser
      labelData={labelsQuery.data ? labelsQuery.data.getLabels : []}
      timeframes={dayConfigQuery.data ? dayConfigQuery.data.getTimeframes : []}
      configs={configs}
      data={data}
      save={saveData}
      closeModal={closeModal}
    />
  );
}
export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getLabels), {
      name: 'labelsQuery',
      options: ({ data }: Props) => ({
        variables: { type: 'Year' }
      })
    })
  )(DateChooserContainer)
);
