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
  stage?: IStage;
  index: number;
  deals: IDeal[];
  length: number;
};

type StageProps = {
  onAddDeal: (stageId: string, deal: IDeal) => void;
} & WrapperProps;

type FinalStageProps = {
  addMutation: SaveDealMutation;
} & StageProps;

class StageContainer extends React.Component<FinalStageProps, {}> {
  render() {
    const { onAddDeal, stage, addMutation } = this.props;

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
      addDeal
    };

    return <Stage {...extendedProps} />;
  }
}

const WithMutation = withProps<StageProps>(
  compose(
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
      {({ onAddDeal }) => {
        return <WithMutation {...props} onAddDeal={onAddDeal} />;
      }}
    </PipelineConsumer>
  );
};
