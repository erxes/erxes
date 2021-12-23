import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import client from 'apolloClient';
import GanttChart from '../../components/gantt/GanttChart';
import {
  IFilterParams,
  IOptions,
  ItemsQueryResponse,
  RemoveStageMutation,
  SaveItemMutation
} from '../../types';
import Spinner from 'modules/common/components/Spinner';
import { mutations } from '../../graphql';
import { callback, generateName } from 'modules/boards/components/gantt/utils';
import { AssingStyle, TextStyle } from 'modules/boards/styles/viewtype';
import Assignees from 'modules/boards/components/Assignees';
import { getColors } from 'modules/boards/utils';

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
  items: any[];
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
    const { itemsQuery, options, groups, groupType } = this.props;

    if (itemsQuery.loading) {
      return <Spinner />;
    }

    const save = (boardItems: any[], links: any[]) => {
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

    const { items } = this.state;

    const dbData: any[] = [];
    const dbLinks: any[] = [];

    console.log('groups: ', groups);

    groups.forEach((groupObj, index) => {
      const filtered = items.filter(item =>
        callback(groupType)(item, groupObj)
      );

      if (filtered.length > 0) {
        dbData.push({
          id: groupObj._id,
          start: new Date('1970-01-01'),
          end: new Date('1970-01-01'),
          name: (
            <TextStyle>
              <span style={{ fontWeight: 600 }}>{generateName(groupObj)}</span>
            </TextStyle>
          )
        });
      }

      filtered.forEach(item => {
        dbData.push({
          id: item._id,
          start: new Date(item.startDate),
          end: new Date(item.closeDate),
          name: (
            <>
              <AssingStyle>
                <Assignees users={item.assignedUsers} />
              </AssingStyle>
              <TextStyle>
                <div style={{ paddingLeft: 20 }}>{item.name}</div>
              </TextStyle>
            </>
          ),
          color: `${groupObj.colorCode || getColors(index)}`
        });

        if (item.relations) {
          dbLinks.push(...item.relations);
        }
      });
    });

    return (
      <GanttChart
        options={options}
        data={dbData}
        links={dbLinks}
        items={items}
        refetch={refetch}
        save={save}
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
