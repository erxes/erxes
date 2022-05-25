import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { useQuery, useMutation, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import DateChooser from '../components/DateChooser';
import { Alert } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import { Spinner } from '@erxes/ui/src/components';
// import {
//   dayplanconfs,
//   labelsQuery,
//   monthplanconfs,
//   saveDayPlan,
//   saveMonthPlan,
//   saveYearPlan,
//   timeframeQuery,
//   yearplanconfs,
// } from "../types";

type Props = {
  data: any;
  closeModal: () => void;
};

type FinalProps = {
  labelsQuery: any;
  timeframeQuery: any;
  dayplanconfs: any;
  monthplanconfs: any;
  yearplanconfs: any;
  saveDayPlan: any;
  saveMonthPlan: any;
  saveYearPlan: any;
} & Props;

function DateChooserContainer({
  data,
  closeModal,
  labelsQuery,
  timeframeQuery,
  dayplanconfs,
  monthplanconfs,
  yearplanconfs,
  saveDayPlan,
  saveMonthPlan,
  saveYearPlan
}: FinalProps) {
  const type = data.type;

  const day = data.date;

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

  if (labelsQuery.loading) return <Spinner objective={true} />;

  return (
    <DateChooser
      labelData={labelsQuery ? labelsQuery.getLabels : []}
      timeframes={timeframeQuery.data ? timeframeQuery.data.getTimeframes : []}
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
        variables: { type: data.type },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.getTimeframes), {
      name: 'timeframeQuery',
      options: ({ data }: Props) => ({
        skip: data.type !== 'Day',
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.getDayPlanConfig), {
      name: 'dayplanconfs',
      options: ({ data }: Props) => ({
        variables: { salesLogId: data._id },
        fetchPolicy: 'network-only',
        skip: data.type !== 'Day'
      })
    }),
    graphql<Props>(gql(queries.getMonthPlanConfig), {
      name: 'monthplanconfs',
      options: ({ data }: Props) => ({
        variables: { salesLogId: data._id },
        fetchPolicy: 'network-only',
        skip: data.type !== 'Month'
      })
    }),
    graphql<Props>(gql(queries.getYearPlanConfig), {
      name: 'yearplanconfs',
      options: ({ data }: Props) => ({
        variables: { salesLogId: data._id },
        fetchPolicy: 'network-only',
        skip: data.type !== 'Year'
      })
    }),
    graphql<{}>(gql(mutations.saveDayPlanConfig), {
      name: 'saveDayPlan'
    }),
    graphql<{}>(gql(mutations.saveMonthPlanConfig), {
      name: 'saveMonthPlan'
    }),
    graphql<{}>(gql(mutations.saveYearPlanConfig), {
      name: 'saveYearPlan'
    })
  )(DateChooserContainer)
);
