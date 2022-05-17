import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';
import DateChooser from '../components/DateChooser';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  data: any;
  closeModal: () => void;
};

function DateChooserContainer({ data, closeModal }: Props) {
  const type = data.type;
  const date = data.date;

  const labelsQuery = useQuery(gql(queries.getMiniPlanLabels), {
    variables: { type }
  });

  const dayplanconfs = useQuery(gql(queries.getMiniPlanDayPlanConf), {
    variables: { saleLogId: data._id },
    fetchPolicy: 'network-only'
  });

  const monthplanconfs = useQuery(gql(queries.getMiniPlanMonthPlanConf), {
    variables: { saleLogId: data._id },
    skip: type !== 'Month'
  });

  if (monthplanconfs.error) {
    return <div>{monthplanconfs.error.message}</div>;
  }

  const [saveDayPlan] = useMutation(gql(mutations.miniPlanSaveDayPlan));

  const [saveMonthPlan] = useMutation(gql(mutations.miniPlanSaveMonthPlan));

  const saveData = (saleLogId, dayConfigs) => {
    if (type === 'Day') {
      saveDayPlan({ variables: { saleLogId, dayConfigs } })
        .then(() => {
          Alert.success('Successfully saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    if (type === 'Month') {
      console.log('client', dayConfigs);
      saveMonthPlan({ variables: { saleLogId, date, dayConfigs } })
        .then(() => {
          Alert.success('Months Successfully saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    closeModal();
  };

  if (labelsQuery.error) {
    return <div>{dayplanconfs.error.message}</div>;
  }

  const dayConfigQuery = useQuery(gql(queries.getMiniPlanDayConfigs), {
    skip: type !== 'Day',
    fetchPolicy: 'network-only'
  });

  if (labelsQuery.error) {
    return <div>{labelsQuery.error.message}</div>;
  }

  if (dayConfigQuery.error) {
    return <div>{dayConfigQuery.error.message}</div>;
  }

  return (
    <DateChooser
      labelData={labelsQuery.data ? labelsQuery.data.getMiniPlanLabels : []}
      dayConfigs={
        dayConfigQuery.data ? dayConfigQuery.data.getMiniPlanDayConfigs : []
      }
      dayPlanConf={
        dayplanconfs.data ? dayplanconfs.data.getMiniPlanDayPlanConf : null
      }
      data={data}
      save={saveData}
      closeModal={closeModal}
    />
  );
}
export default DateChooserContainer;
