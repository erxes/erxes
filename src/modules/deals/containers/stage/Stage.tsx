import gql from 'graphql-tag';
import { __, Alert } from 'modules/common/utils';
import { Stage } from 'modules/deals/components/stage';
import { mutations, queries } from 'modules/deals/graphql';
import { IDeal, IStage, SaveDealMutation } from 'modules/deals/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { PipelineConsumer } from '../PipelineContext';

type BaseProps = {
  index: number;
  stage: IStage;
  deals: IDeal[];
};

type Props = {
  addMutation: SaveDealMutation;
  onAddDeal: (stageId: string, deal: IDeal) => void;
};

class StageContainer extends React.Component<Props & BaseProps, {}> {
  render() {
    const { onAddDeal, stage, addMutation } = this.props;

    // create deal
    const addDeal = (name: string, callback) => {
      addMutation({ variables: { name, stageId: stage._id } })
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

const WithMutation = compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation',
    options: ({ stage }: { stage: IStage }) => ({
      refetchQueries: [
        {
          query: gql(queries.stageDetail),
          variables: { _id: stage._id }
        }
      ]
    })
  })
)(StageContainer);

export default (props: BaseProps) => {
  return (
    <PipelineConsumer>
      {({ onAddDeal }) => {
        return <WithMutation {...props} onAddDeal={onAddDeal} />;
      }}
    </PipelineConsumer>
  );
};
