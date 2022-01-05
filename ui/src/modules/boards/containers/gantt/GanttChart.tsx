import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import client from 'apolloClient';
import GanttChart from '../../components/gantt/GanttChart';
import {
  IFilterParams,
  IItem,
  IOptions,
  ItemsQueryResponse,
  RemoveStageMutation,
  SaveItemMutation
} from '../../types';
import Spinner from 'modules/common/components/Spinner';
import { mutations } from '../../graphql';

export type BoardItemArgs = {
  _id: string;
  startDate: Date;
  closeDate: Date;
};

export type GanttLink = {
  id: string;
  start: string;
  end: string;
};

type StageProps = {
  queryParams: IFilterParams;
  options: IOptions;
  groups: any;
  groupType: string;
};

type FinalStageProps = {
  addMutation: SaveItemMutation;
  itemsQuery: ItemsQueryResponse;
  removeStageMutation: RemoveStageMutation;
} & StageProps;

type State = {
  items: IItem[];
};

class GanttChartContainer extends React.PureComponent<FinalStageProps, State> {
  constructor(props) {
    super(props);

    const { itemsQuery, options } = props;

    this.state = {
      items: itemsQuery[options.queriesName.itemsQuery] || []
    };
  }

  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { itemsQuery, options, queryParams } = nextProps;

    if (this.queryParamsChanged(this.props.queryParams, queryParams)) {
      itemsQuery.refetch();
    }

    if (!itemsQuery.loading) {
      const items = itemsQuery[options.queriesName.itemsQuery] || [];

      this.setState({ items });
    }
  }

  queryParamsChanged = (queryParams: any, nextQueryParams: any) => {
    if (nextQueryParams.itemId || (!queryParams.key && queryParams.itemId)) {
      return false;
    }

    if (queryParams !== nextQueryParams) {
      return true;
    }

    return false;
  };

  render() {
    const { itemsQuery, options, groupType, groups } = this.props;

    if (itemsQuery.loading) {
      return <Spinner />;
    }

    const save = (boardItems: BoardItemArgs[], links: GanttLink[]) => {
      if (boardItems.length === 0) {
        return;
      }

      client
        .mutate({
          mutation: gql(mutations.boardItemsSaveForGanttTimeline),
          variables: {
            items: boardItems,
            links,
            type: options.type
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const refetch = () => {
      itemsQuery.refetch().then(({ data }) => {
        this.setState({
          items: data[options.queriesName.itemsQuery] || []
        });
      });
    };

    return (
      <GanttChart
        options={options}
        items={this.state.items}
        refetch={refetch}
        save={save}
        groupType={groupType}
        groups={groups}
      />
    );
  }
}

const getFilterParams = (
  queryParams: IFilterParams,
  getExtraParams: (queryParams) => any
) => {
  if (!queryParams) {
    return {};
  }

  const selectType = {
    search: queryParams.search,
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    assignedUserIds: queryParams.assignedUserIds,
    labelIds: queryParams.labelIds,
    userIds: queryParams.userIds,
    segment: queryParams.segment,
    assignedToMe: queryParams.assignedToMe,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    pipelineId: queryParams.pipelineId,
    hasStartAndCloseDate: true,
    limit: 100,
    ...getExtraParams(queryParams)
  };

  return selectType;
};

const withQuery = ({ options }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(options.queries.itemsQuery), {
        name: 'itemsQuery',
        options: ({ queryParams }) => ({
          variables: getFilterParams(queryParams, options.getExtraParams),
          fetchPolicy: 'network-only'
        })
      })
    )(GanttChartContainer)
  );
};

class WithData extends React.Component<StageProps> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery({ options: props.options });
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}

export default withProps<StageProps>(WithData);
