import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import AddItemForm from '../components/AddItemForm';
import { mutations } from '../graphql';
import {
  AddItemMutationResponse,
  IChecklist,
  IChecklistItemDoc
} from '../types';

type IProps = {
  checklist: IChecklist;
};

type FinalProps = {
  addMutation: AddItemMutationResponse;
  closeModal: () => void;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  add = (doc: IChecklistItemDoc, callback: () => void) => {
    const { addMutation } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        callback();
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    console.log('hohohohohohohohohoh');
    const updatedProps = {
      ...this.props,
      add: this.add
    };

    return <AddItemForm {...updatedProps} />;
  }
}

export default (props: IProps) => {
  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, AddItemMutationResponse, IChecklistItemDoc>(
        gql(mutations.checklistItemsAdd),
        {
          name: 'addMutation'
          // options: ({ item }: { item: IItem }) => ({
          //   refetchQueries: [
          //     {
          //       query: gql(options.queries.detailQuery),
          //       variables: {
          //         contentType: options.type,
          //         contentTypeId: item._id
          //       }
          //     }
          //   ]
          // })
        }
      )
    )(AddFormContainer)
  );
};
