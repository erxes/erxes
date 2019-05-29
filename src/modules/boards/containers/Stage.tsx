import client from 'apolloClient';
import gql from 'graphql-tag';
import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import {
  IStage,
  Item,
  ItemParams,
  ItemsQueryResponse,
  SaveItemMutation
} from 'modules/boards/types';
import { __, Alert, withProps } from 'modules/common/utils';
import { IQueryParams } from 'modules/insights/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../components/stage';
import { STAGE_CONSTANTS } from '../constants';
import { mutations, queries } from '../graphql';

type WrapperProps = {
  stage: IStage;
  index: number;
  loadingState: 'readyToLoad' | 'loaded';
  items: Item[];
  length: number;
  queryParams: IQueryParams;
  type: string;
};

type StageProps = {
  onLoad: (stageId: string, items: Item[]) => void;
  scheduleStage: (stageId: string) => void;
  onAddItem: (stageId: string, item: Item) => void;
} & WrapperProps;

type FinalStageProps = {
  addMutation: SaveItemMutation;
  itemsQuery?: ItemsQueryResponse;
} & StageProps;

class StageContainer extends React.PureComponent<FinalStageProps> {
  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { stage, loadingState, onLoad, itemsQuery, type } = nextProps;

    if (itemsQuery && !itemsQuery.loading && loadingState !== 'loaded') {
      // Send loaded items to PipelineContext so that context is able to set it
      // to global itemsMap
      onLoad(stage._id, itemsQuery[STAGE_CONSTANTS[type].itemsQuery] || []);
    }
  }

  componentDidMount() {
    const { scheduleStage, stage } = this.props;

    // register stage to queue on first render
    scheduleStage(stage._id);
  }

  loadMore = () => {
    const { onLoad, stage, items, queryParams, type } = this.props;

    if (items.length === stage.itemsTotalCount) {
      return;
    }

    const itemsQuery = STAGE_CONSTANTS[type].itemsQuery;

    client
      .query({
        query: gql(queries[itemsQuery]),
        variables: {
          stageId: stage._id,
          skip: items.length,
          ...getFilterParams(queryParams)
        }
      })
      .then(({ data }: any) => {
        onLoad(stage._id, [...items, ...(data[itemsQuery] || [])]);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  // create item
  addItem = (name: string, callback: () => void) => {
    const { stage, onAddItem, addMutation, type } = this.props;

    if (!stage) {
      return null;
    }

    return addMutation({ variables: { name, stageId: stage._id } })
      .then(({ data }) => {
        const constant = STAGE_CONSTANTS[type];

        Alert.success(constant.successText);

        onAddItem(stage._id, data[constant.addMutation]);

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { index, length, stage, items, itemsQuery, type } = this.props;
    const loadingItems = (itemsQuery ? itemsQuery.loading : null) || false;

    return (
      <Stage
        type={type}
        stage={stage}
        index={index}
        length={length}
        items={items}
        loadingItems={loadingItems}
        loadMore={this.loadMore}
        addItem={this.addItem}
      />
    );
  }
}

const getFilterParams = queryParams => {
  if (!queryParams) {
    return {};
  }

  return {
    search: queryParams.search,
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    assignedUserIds: queryParams.assignedUserIds,
    nextDay: queryParams.nextDay,
    nextWeek: queryParams.nextWeek,
    nextMonth: queryParams.nextMonth,
    noCloseDate: queryParams.noCloseDate,
    overdue: queryParams.overdue,
    productIds: queryParams.productIds
  };
};

const withQuery = ({ type }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(queries[STAGE_CONSTANTS[type].itemsQuery]), {
        name: 'itemsQuery',
        skip: ({ loadingState }) => loadingState !== 'readyToLoad',
        options: ({ stage, queryParams, loadingState }) => ({
          variables: {
            stageId: stage._id,
            ...getFilterParams(queryParams)
          },
          fetchPolicy:
            loadingState === 'readyToLoad' ? 'network-only' : 'cache-only',
          notifyOnNetworkStatusChange: loadingState === 'readyToLoad'
        })
      }),
      // mutation
      graphql<StageProps, SaveItemMutation, ItemParams>(
        gql(mutations[STAGE_CONSTANTS[type].addMutation]),
        {
          name: 'addMutation',
          options: ({ stage }) => ({
            refetchQueries: [
              {
                query: gql(queries.stageDetail),
                variables: { _id: stage && stage._id }
              }
            ]
          })
        }
      )
    )(StageContainer)
  );
};

class WithData extends React.Component<StageProps> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery({ type: props.type });
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}

export default (props: WrapperProps) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onLoadStage, scheduleStage }) => {
        return (
          <WithData
            {...props}
            scheduleStage={scheduleStage}
            onLoad={onLoadStage}
            onAddItem={onAddItem}
          />
        );
      }}
    </PipelineConsumer>
  );
};
