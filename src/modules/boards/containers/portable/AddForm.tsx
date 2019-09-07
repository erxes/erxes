import gql from 'graphql-tag';
import { Alert, renderWithProps } from 'modules/common/utils';
import { mutations } from 'modules/conformity/graphql/';
import {
  EditConformityMutation,
  IConformityEdit
} from 'modules/conformity/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../../components/portable/AddForm';
import { queries } from '../../graphql';
import { IItem, IItemParams, IOptions, SaveMutation } from '../../types';

type IProps = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  relType?: string;
  relTypeIds?: string[];
  closeModal: () => void;
  callback?: () => void;
};

type FinalProps = {
  addMutation: SaveMutation;
  editConformity: EditConformityMutation;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: (item: IItem) => void) => {
    const {
      addMutation,
      options,
      relType,
      relTypeIds,
      editConformity
    } = this.props;

    addMutation({ variables: doc })
      .then(({ data }) => {
        Alert.success(options.texts.addSuccessText);

        if (relType && relTypeIds) {
          editConformity({
            variables: {
              mainType: options.type,
              mainTypeId: data[options.mutationsName.addMutation]._id,
              relType,
              relTypeIds
            }
          });
        }

        callback(data[options.mutationsName.addMutation]);
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
      graphql<IProps, SaveMutation, IItem>(
        gql(props.options.mutations.addMutation),
        {
          name: 'addMutation',
          options: ({ stageId }: { stageId?: string }) => {
            if (!stageId) {
              return {};
            }

            return {
              refetchQueries: [
                {
                  query: gql(queries.stageDetail),
                  variables: { _id: stageId }
                }
              ]
            };
          }
        }
      ),
      graphql<FinalProps, EditConformityMutation, IConformityEdit>(
        gql(mutations.conformityEdit),
        {
          name: 'editConformity'
        }
      )
    )(AddFormContainer)
  );
