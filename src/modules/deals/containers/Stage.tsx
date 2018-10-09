import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { __, Alert } from '../../common/utils';
import { Stage } from '../components';
import { mutations } from '../graphql';
import { IDeal, IStage, SaveDealMutation } from '../types';
import { PipelineConsumer } from './PipelineContext';

type BaseProps = {
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
    name: 'addMutation'
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
