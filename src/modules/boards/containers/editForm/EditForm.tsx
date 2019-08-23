import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { AllUsersQueryResponse } from 'modules/settings/team/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';
import {
  DetailQueryResponse,
  IItem,
  IItemParams,
  IOptions,
  RemoveMutation,
  SaveMutation
} from '../../types';
import { invalidateCache } from '../../utils';
import { PipelineConsumer } from '../PipelineContext';

type WrapperProps = {
  itemId: string;
  stageId: string;
  options?: IOptions;
  beforePopupClose?: () => void;
  onAdd?: (stageId: string, item: IItem) => void;
  onRemove?: (itemId: string, stageId: string) => void;
  onUpdate?: (item: IItem, prevStageId: string) => void;
  isPopupVisible?: boolean;
};

type ContainerProps = {
  onAdd: (stageId: string, item: IItem) => void;
  onRemove: (itemId: string, stageId: string) => void;
  onUpdate: (item: IItem, prevStageId: string) => void;
  options: IOptions;
} & WrapperProps;

type FinalProps = {
  detailQuery: DetailQueryResponse;
  usersQuery: AllUsersQueryResponse;
  // Using this mutation to copy item in edit form
  addMutation: SaveMutation;
  editMutation: SaveMutation;
  removeMutation: RemoveMutation;
} & ContainerProps;

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

  saveItem = (doc: IItemParams, callback: (item) => void) => {
    const { itemId, editMutation, options } = this.props;

    editMutation({ variables: { _id: itemId, ...doc } })
      .then(({ data }) => {
        Alert.success(options.texts.updateSuccessText);

        if (callback) {
          callback(data[options.mutationsName.editMutation]);
        }

        invalidateCache();
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

    const users = usersQuery.allUsers;
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

const withQuery = (props: ContainerProps) => {
  const { options } = props;

  return withProps<ContainerProps>(
    compose(
      graphql<ContainerProps, DetailQueryResponse, { _id: string }>(
        gql(options.queries.detailQuery),
        {
          name: 'detailQuery',
          options: ({ itemId }: { itemId: string }) => {
            return {
              variables: {
                _id: itemId
              },
              fetchPolicy: 'network-only'
            };
          }
        }
      ),
      graphql<ContainerProps, AllUsersQueryResponse>(
        gql(userQueries.allUsers),
        {
          name: 'usersQuery'
        }
      ),
      graphql<ContainerProps, SaveMutation, IItemParams>(
        gql(options.mutations.addMutation),
        {
          name: 'addMutation',
          options: ({ stageId }: { stageId: string }) => ({
            refetchQueries: [
              {
                query: gql(queries.stageDetail),
                variables: { _id: stageId }
              }
            ]
          })
        }
      ),
      graphql<ContainerProps, SaveMutation, IItemParams>(
        gql(options.mutations.editMutation),
        {
          name: 'editMutation'
        }
      ),
      graphql<ContainerProps, RemoveMutation, { _id: string }>(
        gql(options.mutations.removeMutation),
        {
          name: 'removeMutation',
          options: ({ stageId }: { stageId: string }) => ({
            refetchQueries: [
              {
                query: gql(queries.stageDetail),
                variables: { _id: stageId }
              }
            ]
          })
        }
      )
    )(EditFormContainer)
  );
};

class WithData extends React.Component<ContainerProps> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery(props);
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}

export default (props: WrapperProps) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem, options }) => {
        return (
          <WithData
            {...props}
            onAdd={onAddItem || props.onAdd}
            onRemove={onRemoveItem || props.onRemove}
            onUpdate={onUpdateItem || props.onUpdate}
            options={options || props.options}
          />
        );
      }}
    </PipelineConsumer>
  );
};
