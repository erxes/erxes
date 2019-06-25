import gql from 'graphql-tag';
import { Alert, renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { AddForm } from '../../components/portable';
import { IItem, IItemParams, IOptions, SaveMutation } from '../../types';

type IProps = {
  options: IOptions;
  customerIds?: string[];
  companyIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  closeModal: () => void;
  onAddItem: (stageId: string, item: IItem) => void;
};

type FinalProps = {
  addMutation: SaveMutation;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: () => void) => {
    const { addMutation, onAddItem, options, stageId } = this.props;

    addMutation({ variables: doc })
      .then(({ data }) => {
        Alert.success(options.texts.addSuccessText);

        if (onAddItem && stageId) {
          onAddItem(stageId, data[options.mutationsName.addMutation]);
        }

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      saveItem: this.saveItem
    };

    return <AddForm {...extendedProps} />;
  }
}

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      // mutation
      graphql<{}, SaveMutation, IItemParams>(
        gql(props.options.mutations.addMutation),
        {
          name: 'addMutation'
        }
      )
    )(AddFormContainer)
  );
