import gql from 'graphql-tag';
import { IItem, IOptions } from 'modules/boards/types';
import { Alert, renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../components/AddForm';
import { mutations } from '../graphql';
import { AddMutationResponse, IChecklistDoc } from '../types';

type IProps = {
  item: IItem;
  options: IOptions;
  closeModal: () => void;
};

type FinalProps = {
  addMutation: AddMutationResponse;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IChecklistDoc) => {
    const { addMutation } = this.props;

    addMutation({ variables: doc });
  };

  render() {
    const updatedProps = {
      ...this.props,
      saveItem: this.saveItem
    };

    return <AddForm {...updatedProps} />;
  }
}

export default (props: IProps) => {
  const { options } = props;

  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, AddMutationResponse, IChecklistDoc>(
        gql(mutations.checklistsAdd),
        {
          name: 'addMutation',
          options: ({ item }: { item: IItem }) => ({
            refetchQueries: [
              {
                query: gql(options.queries.detailQuery),
                variables: {
                  contentType: options.type,
                  contentTypeId: item._id
                }
              }
            ]
          })
        }
      )
    )(AddFormContainer)
  );
};
