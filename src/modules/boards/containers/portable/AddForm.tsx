import gql from 'graphql-tag';
import { Alert, renderWithProps } from 'modules/common/utils';
import { mutations } from 'modules/conformity/graphql/';
import {
  CreateConformityMutation,
  IConformityCreate
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
  companyIds?: string[];
  customerIds?: string[];
  closeModal: () => void;
  callback?: () => void;
};

type FinalProps = {
  addMutation: SaveMutation;
  createConformity: CreateConformityMutation;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: (item: IItem) => void) => {
    const {
      addMutation,
      options,
      customerIds,
      companyIds,
      createConformity
    } = this.props;

    addMutation({ variables: doc })
      .then(({ data }) => {
        Alert.success(options.texts.addSuccessText);

        if (customerIds) {
          createConformity({
            variables: {
              mainType: options.type,
              mainTypeId: data[options.mutationsName.addMutation]._id,
              relType: 'customer',
              relTypeIds: customerIds
            }
          });
        }

        if (companyIds) {
          createConformity({
            variables: {
              mainType: options.type,
              mainTypeId: data[options.mutationsName.addMutation]._id,
              relType: 'company',
              relTypeIds: companyIds
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
      graphql<FinalProps, CreateConformityMutation, IConformityCreate>(
        gql(mutations.conformityCreate),
        {
          name: 'createConformity'
        }
      )
    )(AddFormContainer)
  );
