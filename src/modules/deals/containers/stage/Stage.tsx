import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
import { Stage } from 'modules/deals/components/stage';
import { mutations, queries } from 'modules/deals/graphql';
import {
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
  isLoadedDeals: boolean;
  deals: IDeal[];
  length: number;
};

type StageProps = {
  onLoad: (stageId: string, deals: IDeal[]) => void;
  onAddDeal: (stageId: string, deal: IDeal) => void;
} & WrapperProps;

type FinalStageProps = {
  addMutation: SaveDealMutation;
  dealsQuery: any;
} & StageProps;

class StageContainer extends React.PureComponent<
  FinalStageProps,
  { loadedDeals: boolean }
> {
  componentWillReceiveProps(nextProps: FinalStageProps) {
    const { stage, isLoadedDeals, onLoad, dealsQuery } = nextProps;

    if (!dealsQuery.loading && !isLoadedDeals) {
      onLoad(stage._id, dealsQuery.deals || []);
    }
  }

  render() {
    const { onAddDeal, stage, dealsQuery, addMutation } = this.props;
    const loadingDeals = dealsQuery.loading;

    // create deal
    const addDeal = (name: string, callback) => {
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

    const extendedProps = {
      ...this.props,
      loadingDeals,
      addDeal
    };

    return <Stage {...extendedProps} />;
  }
}

const WithData = withProps<StageProps>(
  compose(
    graphql<StageProps>(gql(queries.deals), {
      name: 'dealsQuery',
      options: ({ stage }) => ({
        variables: {
          stageId: stage._id
        }
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
      {({ onAddDeal, onLoadStage, stageLoadMap }) => {
        return (
          <WithData {...props} onLoad={onLoadStage} onAddDeal={onAddDeal} />
        );
      }}
    </PipelineConsumer>
  );
};
