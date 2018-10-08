import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Stage } from '../components';
import { mutations } from '../graphql';
import {
  IDeal,
  IDealParams,
  IStage,
  RemoveDealMutation,
  SaveDealMutation
} from '../types';
import { removeDeal as remove, saveDeal as save } from '../utils';

type Props = {
  stage: IStage;
  deals: IDeal[];
  addMutation: SaveDealMutation;
  editMutation: SaveDealMutation;
  removeMutation: RemoveDealMutation;
  dealsUpdateOrderMutation: (
    params: { variables: { orders: Array<{ _id: string; order: number }> } }
  ) => Promise<any>;
  dealsChangeMutation: (
    params: { variables: { _id: string; stageId: string } }
  ) => Promise<any>;
  dealsUpdateOrder: any;
};

class StageContainer extends React.Component<Props, {}> {
  constructor(props) {
    super(props);

    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
  }

  // create or update deal
  saveDeal(doc: IDealParams, callback: () => void, deal?: IDeal) {
    const { addMutation, editMutation } = this.props;

    save(
      doc,
      addMutation,
      editMutation,
      () => {
        callback();
      },
      deal
    );
  }

  // remove deal
  removeDeal(_id: string) {
    const { removeMutation } = this.props;

    remove(_id, removeMutation, () => {});
  }

  render() {
    const extendedProps = {
      ...this.props,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal
    };

    return <Stage {...extendedProps} />;
  }
}

export default compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation'
  }),
  graphql(gql(mutations.dealsUpdateOrder), {
    name: 'dealsUpdateOrderMutation'
  }),
  graphql(gql(mutations.dealsChange), {
    name: 'dealsChangeMutation'
  })
)(StageContainer);
