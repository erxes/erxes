import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import YearPlans from '../components/YearPlanList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  YearPlansQueryResponse,
  YearPlansRemoveMutationResponse,
  YearPlansTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  yearPlanQuery: YearPlansQueryResponse;
  yearPlanTotalCountQuery: YearPlansTotalCountQueryResponse;
} & Props &
  YearPlansRemoveMutationResponse;

class YearPlansContainer extends React.Component<FinalProps> {
  render() {
    const {
      yearPlanQuery,
      yearPlanTotalCountQuery,
      queryParams,
      yearPlansRemove
    } = this.props;

    if (yearPlanQuery.loading || yearPlanTotalCountQuery.loading) {
      return <Spinner />;
    }

    // remove action
    const remove = ({ yearPlanIds }, emptyBulk) => {
      yearPlansRemove({
        variables: { _ids: yearPlanIds }
      })
        .then(removeStatus => {
          emptyBulk();

          removeStatus.data.yearPlansRemove.deletedCount
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const filterStatus = this.props.queryParams.filterStatus || '';
    const minMultiplier = this.props.queryParams.minMultiplier;
    const maxMultiplier = this.props.queryParams.maxMultiplier;

    const yearPlans = yearPlanQuery.yearPlans || [];
    const totalCount = yearPlanTotalCountQuery.yearPlansCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      yearPlans,
      totalCount,
      remove,
      searchValue,
      filterStatus,
      minMultiplier,
      maxMultiplier
    };

    const yearPlanList = props => <YearPlans {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.yearPlanQuery.refetch();
    };

    return <Bulk content={yearPlanList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['yearPlans'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  filterStatus: queryParams.filterStatus,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  minMultiplier: Number(queryParams.minMultiplier) || undefined,
  maxMultiplier: Number(queryParams.maxMultiplier) || undefined
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, YearPlansQueryResponse>(
      gql(queries.yearPlans),
      {
        name: 'yearPlanQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, YearPlansTotalCountQueryResponse>(
      gql(queries.yearPlansCount),
      {
        name: 'yearPlanTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, YearPlansRemoveMutationResponse, { yearPlanIds: string[] }>(
      gql(mutations.yearPlansRemove),
      {
        name: 'yearPlansRemove',
        options
      }
    )
  )(YearPlansContainer)
);
