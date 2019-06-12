import gql from 'graphql-tag';
import { queries as boardQueries } from 'modules/boards/graphql';
import { Spinner } from 'modules/common/components';
import { Alert, confirm, renderWithProps } from 'modules/common/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  DetailQueryResponse,
  IItem,
  IItemParams,
  IOptions,
  RemoveMutation,
  SaveMutation
} from '../../types';
import { invalidateCache } from '../../utils';

type IProps = {
  options: IOptions;
  itemId: string;
  stageId: string;
  onAdd?: (stageId: string, item: IItem) => void;
  onRemove?: (itemId: string, stageId: string) => void;
  onUpdate?: (item: IItem, prevStageId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  detailQuery: DetailQueryResponse;
  usersQuery: UsersQueryResponse;
  // Using this mutation to copy item in edit form
  addMutation: SaveMutation;
  editMutation: SaveMutation;
  removeMutation: RemoveMutation;
} & IProps;

class EditFormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  addItem(
    doc: IItemParams,
    callback: () => void,
    msg = this.props.options.texts.addSuccessText
  ) {
    const { onAdd, addMutation, stageId, options } = this.props;

    addMutation({ variables: doc })
      .then(({ data }) => {
        Alert.success(msg);

        callback();

        if (onAdd) {
          onAdd(stageId, data[options.mutationsName.addMutation]);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  saveItem = (doc: IItemParams, callback: () => void) => {
    const { stageId, itemId, editMutation, onUpdate, options } = this.props;

    editMutation({ variables: { _id: itemId, ...doc } })
      .then(({ data }) => {
        Alert.success(options.texts.updateSuccessText);

        callback();

        if (onUpdate) {
          invalidateCache();

          onUpdate(data[options.mutationsName.editMutation], stageId);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  removeItem = (itemId: string, callback) => {
    const { removeMutation, onRemove, stageId, options } = this.props;

    confirm().then(() =>
      removeMutation({ variables: { _id: itemId } })
        .then(() => {
          callback();

          Alert.success(options.texts.deleteSuccessText);

          if (onRemove) {
            invalidateCache();

            onRemove(itemId, stageId);
          }
        })

        .catch(error => {
          Alert.error(error.message);
        })
    );
  };

  render() {
    const { usersQuery, detailQuery, options } = this.props;

    if (usersQuery.loading || detailQuery.loading) {
      return <Spinner />;
    }

    const users = usersQuery.users;
    const item = detailQuery[options.queriesName.detailQuery];

    if (!item) {
      return null;
    }

    const extendedProps = {
      ...this.props,
      item,
      addItem: this.addItem,
      removeItem: this.removeItem,
      saveItem: this.saveItem,
      users
    };

    const EditForm = options.EditForm;

    return <EditForm {...extendedProps} />;
  }
}

export default (props: IProps) => {
  const { options } = props;

  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, DetailQueryResponse, { _id: string }>(
        gql(options.queries.detailQuery),
        {
          name: 'detailQuery',
          options: ({ itemId }: { itemId: string }) => {
            return {
              variables: {
                _id: itemId
              }
            };
          }
        }
      ),
      graphql<IProps, UsersQueryResponse>(gql(userQueries.usersForSelector), {
        name: 'usersQuery'
      }),
      graphql<IProps, SaveMutation, IItemParams>(
        gql(options.mutations.addMutation),
        {
          name: 'addMutation',
          options: ({ stageId }: { stageId: string }) => ({
            refetchQueries: [
              {
                query: gql(boardQueries.stageDetail),
                variables: { _id: stageId }
              }
            ]
          })
        }
      ),
      graphql<IProps, SaveMutation, IItemParams>(
        gql(options.mutations.editMutation),
        {
          name: 'editMutation',
          options: ({
            itemId,
            stageId
          }: {
            stageId: string;
            itemId: string;
          }) => ({
            refetchQueries: [
              {
                query: gql(options.queries.detailQuery),
                variables: { _id: itemId }
              },
              {
                query: gql(boardQueries.stageDetail),
                variables: { _id: stageId }
              }
            ]
          })
        }
      ),
      graphql<IProps, RemoveMutation, { _id: string }>(
        gql(options.mutations.removeMutation),
        {
          name: 'removeMutation',
          options: ({ stageId }: { stageId: string }) => ({
            refetchQueries: [
              {
                query: gql(boardQueries.stageDetail),
                variables: { _id: stageId }
              }
            ]
          })
        }
      )
    )(EditFormContainer)
  );
};
