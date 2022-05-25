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
  const day = data.date;

  const labelsQuery = useQuery(gql(queries.getLabels), {
    variables: { type }
  });

  const dayplanconfs = useQuery(gql(queries.getDayPlanConfig), {
    variables: { salesLogId: data._id },
    fetchPolicy: 'network-only'
  });

  const monthplanconfs = useQuery(gql(queries.getMonthPlanConfig), {
    variables: { salesLogId: data._id },
    skip: type !== 'Month'
  });

  const [saveDayPlan] = useMutation(gql(mutations.saveDayPlanConfig));

  const [saveMonthPlan] = useMutation(gql(mutations.saveMonthPlanConfig));

  const saveData = (salesLogId, data) => {
    if (type === 'Day') {
      saveDayPlan({ variables: { salesLogId, data } })
        .then(() => {
          Alert.success('Successfully saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    if (type === 'Month') {
      saveMonthPlan({ variables: { salesLogId, day, data } })
        .then(() => {
          Alert.success('Months Successfully saved!');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
    closeModal();
  };

  const dayConfigQuery = useQuery(gql(queries.getDayPlanConfig), {
    skip: type !== 'Day',
    fetchPolicy: 'network-only'
  });

  return (
    <DateChooser
      labelData={labelsQuery.data ? labelsQuery.data.getLabels : []}
      dayConfigs={dayConfigQuery.data ? dayConfigQuery.data.getTimeframes : []}
      dayPlanConf={
        dayplanconfs.data ? dayplanconfs.data.getDayPlanConfig : null
      }
      data={data}
      save={saveData}
      closeModal={closeModal}
    />
  );
}
export default DateChooserContainer;
