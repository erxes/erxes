import client from 'apolloClient';
import gql from 'graphql-tag';
import { __, Alert } from 'modules/common/utils';
import { queries as dealsQueries } from 'modules/deals/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../../components/stage';
import { mutations, queries } from '../../graphql';
import {
  IStage,
  Item,
  ItemParams,
  ItemsQueryResponse,
  SaveItemMutation
} from '../../types';
import { withProps } from '../../utils';
import { PipelineConsumer } from '../PipelineContext';

type WrapperProps = {
  stage: IStage;
  index: number;
  loadingState: 'readyToLoad' | 'loaded';
  items: Item[];
  length: number;
  search?: string;
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

class StageContainer extends React.PureComponent<
  FinalStageProps,
  { loadedDeals: boolean }
> {
  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { stage, loadingState, onLoad, itemsQuery } = nextProps;

    if (itemsQuery && !itemsQuery.loading && loadingState !== 'loaded') {
      // Send loaded items to PipelineContext so that context is able to set it
      // to global dealsMap
      onLoad(stage._id, itemsQuery.deals || []);
    }
  }

  componentDidMount() {
    const { scheduleStage, stage } = this.props;

    console.log('componentDidMount this.props: ', this.props); //tslint:disable-line

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
        query: gql(dealsQueries.deals),
        variables: {
          stageId: stage._id,
          search,
          skip: items.length
        }
      })
      .then(({ data }: any) => {
        onLoad(stage._id, [...items, ...(data.items || [])]);
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
        Alert.success('You successfully added a ' + type);

        onAddItem(stage._id, data[type + 'sAdd']);

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

const WithData = (props: StageProps) =>
  withProps<StageProps>(
    props,
    compose(
      graphql<StageProps>(gql(dealsQueries[props.type + 's']), {
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
      graphql<StageProps, SaveItemMutation, ItemParams>(
        gql(mutations[props.type + 'sAdd']),
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
