import client from 'apolloClient';
import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
import { Stage } from 'modules/deals/components/stage';
import { mutations, queries } from 'modules/deals/graphql';
import {
  DealsQueryResponse,
  IDeal,
  IDealParams,
  IStage,
  SaveDealMutation
} from 'modules/deals/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PipelineConsumer } from '../PipelineContext';

type WrapperProps = {
  stage: IStage;
  index: number;
  loadingState: 'readyToLoad' | 'loaded';
  deals: IDeal[];
  length: number;
  search?: string;
};

type StageProps = {
  onLoad: (stageId: string, deals: IDeal[]) => void;
  scheduleStage: (stageId: string) => void;
  onAddDeal: (stageId: string, deal: IDeal) => void;
} & WrapperProps;

type FinalStageProps = {
  addMutation: SaveDealMutation;
  dealsQuery?: DealsQueryResponse;
} & StageProps;

class StageContainer extends React.PureComponent<
  FinalStageProps,
  { loadedDeals: boolean }
> {
  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { stage, loadingState, onLoad, dealsQuery } = nextProps;

    if (dealsQuery && !dealsQuery.loading && loadingState !== 'loaded') {
      // Send loaded deals to PipelineContext so that context is able to set it
      // to global dealsMap
      onLoad(stage._id, dealsQuery.deals || []);
    }
  }

  componentDidMount() {
    const { scheduleStage, stage } = this.props;

    // register stage to queue on first render
    scheduleStage(stage._id);
  }

  loadMore = () => {
    const { onLoad, stage, deals, search } = this.props;

    if (deals.length === stage.dealsTotalCount) {
      return;
    }

    client
      .query({
        query: gql(queries.deals),
        variables: {
          stageId: stage._id,
          search,
          skip: deals.length
        }
      })
      .then(({ data }: any) => {
        onLoad(stage._id, [...deals, ...(data.deals || [])]);
      });
  };

  // create deal
  addDeal = (name: string, callback: () => void) => {
    const { stage, onAddDeal, addMutation } = this.props;

    if (!stage) {
      return null;
    }

    return addMutation({ variables: { name, stageId: stage._id } })
      .then(({ data: { dealsAdd } }) => {
        Alert.success(__('Successfully saved.'));

        onAddDeal(stage._id, dealsAdd);

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { index, length, stage, deals, dealsQuery } = this.props;
    const loadingDeals = (dealsQuery ? dealsQuery.loading : null) || false;

    return (
      <Stage
        stage={stage}
        index={index}
        length={length}
        deals={deals}
        loadingDeals={loadingDeals}
        loadMore={this.loadMore}
        addDeal={this.addDeal}
      />
    );
  }
}

const WithData = withProps<StageProps>(
  compose(
    graphql<StageProps>(gql(queries.deals), {
      name: 'dealsQuery',
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
    graphql<StageProps, SaveDealMutation, IDealParams>(
      gql(mutations.dealsAdd),
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
      {({ onAddDeal, onLoadStage, scheduleStage }) => {
        return (
          <WithData
            {...props}
            scheduleStage={scheduleStage}
            onLoad={onLoadStage}
            onAddDeal={onAddDeal}
          />
        );
      }}
    </PipelineConsumer>
  );
};
