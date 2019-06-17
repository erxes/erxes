import client from 'apolloClient';
import gql from 'graphql-tag';
import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import {
  IItem,
  IItemParams,
  IOptions,
  IStage,
  ItemsQueryResponse,
  SaveItemMutation
} from 'modules/boards/types';
import { __, Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../components/stage';
import { queries } from '../graphql';
import { IFilterParams } from '../types';

type WrapperProps = {
  stage: IStage;
  index: number;
  loadingState: 'readyToLoad' | 'loaded';
  items: IItem[];
  length: number;
  queryParams: IFilterParams;
  options: IOptions;
};

type StageProps = {
  onLoad: (stageId: string, items: IItem[]) => void;
  scheduleStage: (stageId: string) => void;
  onAddItem: (stageId: string, item: IItem) => void;
} & WrapperProps;

type FinalStageProps = {
  addMutation: SaveItemMutation;
  itemsQuery?: ItemsQueryResponse;
} & StageProps;

class StageContainer extends React.PureComponent<FinalStageProps> {
  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { stage, loadingState, onLoad, itemsQuery, options } = nextProps;

    if (itemsQuery && !itemsQuery.loading && loadingState !== 'loaded') {
      // Send loaded items to PipelineContext so that context is able to set it
      // to global itemsMap
      onLoad(stage._id, itemsQuery[options.queriesName.itemsQuery] || []);
    }
  }

  componentDidMount() {
    const { scheduleStage, stage } = this.props;

    // register stage to queue on first render
    scheduleStage(stage._id);
  }

  loadMore = () => {
    const { onLoad, stage, items, queryParams, options } = this.props;

    if (items.length === stage.itemsTotalCount) {
      return;
    }

    client
      .query({
        query: gql(options.queries.itemsQuery),
        variables: {
          stageId: stage._id,
          skip: items.length,
          ...getFilterParams(queryParams)
        }
      })
      .then(({ data }: any) => {
        onLoad(stage._id, [
          ...items,
          ...(data[options.queriesName.itemsQuery] || [])
        ]);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  // create item
  addItem = (name: string, callback: () => void) => {
    const { stage, onAddItem, addMutation, options } = this.props;

    if (!stage) {
      return null;
    }

    return addMutation({ variables: { name, stageId: stage._id } })
      .then(({ data }) => {
        Alert.success(options.texts.addSuccessText);

        onAddItem(stage._id, data[options.mutationsName.addMutation]);

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { index, length, stage, items, itemsQuery, options } = this.props;
    const loadingItems = (itemsQuery ? itemsQuery.loading : null) || false;

    return (
      <Stage
        options={options}
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

const getFilterParams = (queryParams: IFilterParams) => {
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

const withQuery = ({ options }) => {
  return withProps<StageProps>(
    compose(
      graphql<StageProps>(gql(options.queries.itemsQuery), {
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
      graphql<StageProps, SaveItemMutation, IItemParams>(
        gql(options.mutations.addMutation),
        {
          name: 'addMutation',
          options: ({ stage }) => ({
            refetchQueries: [
              {
                query: gql(queries.stageDetail),
                variables: {
                  _id: stage && stage._id
                }
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

    this.withQuery = withQuery({ options: props.options });
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
