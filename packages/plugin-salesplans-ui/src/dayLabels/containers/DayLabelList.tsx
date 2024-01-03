import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import DayLabels from '../components/DayLabelList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import { IDayLabel } from '../types';
import {
  DayLabelsQueryResponse,
  DayLabelsRemoveMutationResponse,
  DayLabelsCountQueryResponse,
  DayLabelsEditMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  dayLabelQuery: DayLabelsQueryResponse;
  dayLabelsCountQuery: DayLabelsCountQueryResponse;
} & Props &
  DayLabelsEditMutationResponse &
  DayLabelsRemoveMutationResponse;

class DayLabelsContainer extends React.Component<FinalProps> {
  render() {
    const {
      dayLabelQuery,
      dayLabelsCountQuery,
      queryParams,
      dayLabelEdit,
      dayLabelsRemove
    } = this.props;

    if (dayLabelQuery.loading || dayLabelsCountQuery.loading) {
      return <Spinner />;
    }

    // edit row action
    const edit = (doc: IDayLabel) => {
      dayLabelEdit({
        variables: { ...doc }
      })
        .then(() => {
          Alert.success('You successfully updated a labels');
          dayLabelQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // remove action
    const remove = ({ dayLabelIds }, emptyBulk) => {
      dayLabelsRemove({
        variables: { _ids: dayLabelIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a day label');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const dayLabels = dayLabelQuery.dayLabels || [];
    const totalCount = dayLabelsCountQuery.dayLabelsCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      dayLabels,
      totalCount,
      edit,
      remove
    };

    const dayLabelList = props => <DayLabels {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.dayLabelQuery.refetch();
    };

    return <Bulk content={dayLabelList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['dayLabels', 'dayLabelsCount'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

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
  endDate: queryParams.endDate
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, DayLabelsQueryResponse>(
      gql(queries.dayLabels),
      {
        name: 'dayLabelQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, DayLabelsCountQueryResponse>(
      gql(queries.dayLabelsCount),
      {
        name: 'dayLabelsCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, DayLabelsEditMutationResponse, {}>(
      gql(mutations.dayLabelEdit),
      {
        name: 'dayLabelEdit'
      }
    ),
    graphql<Props, DayLabelsRemoveMutationResponse, { dayLabelIds: string[] }>(
      gql(mutations.dayLabelsRemove),
      {
        name: 'dayLabelsRemove',
        options
      }
    )
  )(DayLabelsContainer)
);
