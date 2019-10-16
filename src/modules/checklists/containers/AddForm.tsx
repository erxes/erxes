import gql from 'graphql-tag';
import { IItem, IOptions } from 'modules/boards/types';
import { Alert, renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../components/AddForm';
import { mutations, queries } from '../graphql';
import { AddMutationResponse, IChecklistDoc } from '../types';

type IProps = {
  item: IItem;
  options: IOptions;
  afterSave: () => void;
};

type FinalProps = {
  addMutation: AddMutationResponse;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  add = (doc: IChecklistDoc, callback: () => void) => {
    const { addMutation } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success('Success');
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
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
          name: 'addMutation',
          options: () => ({
            refetchQueries: [
              {
                query: gql(queries.checklists),
                variables: {
                  contentType: props.options.type,
                  contentTypeId: props.item._id
                }
              }
            ]
          })
        }
      )
    )(AddFormContainer)
  );
};
