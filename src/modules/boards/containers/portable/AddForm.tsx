import gql from 'graphql-tag';
import { Alert, renderWithProps } from 'modules/common/utils';

import { mutations } from 'modules/conformity/graphql';
import {
  AddConformityMutation,
  IConformityDoc
} from 'modules/conformity/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../../components/portable/AddForm';
import { queries } from '../../graphql';
import { IItem, IItemParams, IOptions, SaveMutation } from '../../types';

type IProps = {
  options: IOptions;
  mainType: string;
  mainTypeId: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  closeModal: () => void;
  callback?: () => void;
};

type FinalProps = {
  addMutation: SaveMutation;
  addConformity: ({ variables: AddConformityMutation }) => void;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: (item: IItem) => void) => {
    const {
      addMutation,
      options,
      mainType,
      mainTypeId,
      addConformity
    } = this.props;

    addMutation({ variables: doc })
      .then(({ data }) => {
        Alert.success(options.texts.addSuccessText);

        addConformity({
          variables: {
            mainType,
            mainTypeId,
            relType: options.type,
            relTypeId: data[options.mutationsName.addMutation]._id
          }
        });

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
      graphql<IProps, AddConformityMutation, IConformityDoc>(
        gql(mutations.conformityAdd),
        {
          name: 'addConformity'
        }
      )
    )(AddFormContainer)
  );
