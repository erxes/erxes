import gql from 'graphql-tag';
import { IItem, IOptions } from 'modules/boards/types';
import { renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../components/AddForm';
import { mutations } from '../graphql';
import { AddMutationResponse, IChecklistDoc } from '../types';

type IProps = {
  item: IItem;
  options: IOptions;
};

type FinalProps = {
  addMutation: AddMutationResponse;
  closeModal: () => void;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  add = (doc: IChecklistDoc, callback: () => void) => {
    const { addMutation } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        console.log('zzzzzzz');
        callback();
      })
      .catch(error => {
        console.log(error);
      });
  };
  render() {
    const updatedProps = {
      ...this.props,
      add: this.add
    };

    return <AddForm {...updatedProps} />;
  }
}

export default (props: IProps) => {
  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, AddMutationResponse, IChecklistDoc>(
        gql(mutations.checklistsAdd),
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
