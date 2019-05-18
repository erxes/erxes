import client from 'apolloClient';
import gql from 'graphql-tag';
import { PipelineConsumer } from 'modules/boards/containers/PipelineContext';
import { queries as boardsQueries } from 'modules/boards/graphql';
import {
  IStage,
  Item,
  ItemParams,
  ItemsQueryResponse,
  SaveItemMutation
} from 'modules/boards/types';
import { __, Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../../components/stage';
import { mutations, queries } from '../../graphql';
import { invalidateCalendarCache } from '../../utils';

type WrapperProps = {
  stage: IStage;
  index: number;
  loadingState: 'readyToLoad' | 'loaded';
  items: Item[];
  length: number;
  search?: string;
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
    const { stage, loadingState, onLoad, itemsQuery } = nextProps;

    if (itemsQuery && !itemsQuery.loading && loadingState !== 'loaded') {
      // Send loaded items to PipelineContext so that context is able to set it
      // to global itemsMap
      onLoad(stage._id, itemsQuery.deals || []);
    }
  }

  componentDidMount() {
    const { scheduleStage, stage } = this.props;

    // register stage to queue on first render
    scheduleStage(stage._id);
  }

  loadMore = () => {
    const { onLoad, stage, items, search } = this.props;

    if (items.length === stage.itemsTotalCount) {
      return;
    }

    client
      .query({
        query: gql(queries.deals),
        variables: {
          stageId: stage._id,
          search,
          skip: items.length
        }
      })
      .then(({ data }: any) => {
        onLoad(stage._id, [...items, ...(data.deals || [])]);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  // create item
  addDeal = (name: string, callback: () => void) => {
    const { stage, onAddItem, addMutation } = this.props;

    if (!stage) {
      return null;
    }

    return addMutation({ variables: { name, stageId: stage._id } })
      .then(({ data }) => {
        Alert.success('You successfully added a deal');

        invalidateCalendarCache();

        onAddItem(stage._id, data.dealsAdd);

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { index, length, stage, items, itemsQuery } = this.props;
    const loadingItems = (itemsQuery ? itemsQuery.loading : null) || false;

    return (
      <Stage
        stage={stage}
        index={index}
        length={length}
        items={items}
        loadingItems={loadingItems}
        loadMore={this.loadMore}
        addDeal={this.addDeal}
      />
    );
  }
}

const WithData = withProps<StageProps>(
  compose(
    graphql<StageProps>(gql(queries.deals), {
      name: 'itemsQuery',
      skip: ({ loadingState }) => loadingState !== 'readyToLoad',
      options: ({ stage, search, loadingState }) => ({
        variables: {
          stageId: stage._id,
          search
        },
        fetchPolicy:
          loadingState === 'readyToLoad' ? 'network-only' : 'cache-only',
        notifyOnNetworkStatusChange: loadingState === 'readyToLoad'
      })
    }),
    // mutation
    graphql<StageProps, SaveItemMutation, ItemParams>(gql(mutations.dealsAdd), {
      name: 'addMutation',
      options: ({ stage }) => ({
        refetchQueries: [
          {
            query: gql(boardsQueries.stageDetail),
            variables: { _id: stage && stage._id }
          }
        ]
      })
    })
  )(StageContainer)
);

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
