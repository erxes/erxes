import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { AllUsersQueryResponse } from 'modules/settings/team/types';
import React from 'react';
import { graphql } from 'react-apollo';
import ErrorMsg from '../../../common/components/ErrorMsg';
import { queries, subscriptions } from '../../graphql';
import {
  CopyMutation,
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
  isPopupVisible: boolean;
  beforePopupClose?: () => void;
  onAdd?: (stageId: string, item: IItem, aboveItemId?: string) => void;
  onRemove?: (itemId: string, stageId: string) => void;
  onUpdate?: (item: IItem, prevStageId: string) => void;
  hideHeader?: boolean;
};

type ContainerProps = {
  onAdd: (stageId: string, item: IItem, aboveItemId?: string) => void;
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
  copyMutation: CopyMutation;
} & ContainerProps;

class EditFormContainer extends React.Component<FinalProps> {
  private unsubcribe;

  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.copyItem = this.copyItem.bind(this);
  }

  componentDidMount() {
    const { detailQuery, itemId } = this.props;

    this.unsubcribe = detailQuery.subscribeToMore({
      document: gql(subscriptions.pipelinesChanged),
      variables: { _id: itemId },
      updateQuery: (
        prev,
        {
          subscriptionData: {
            data: { pipelinesChanged }
          }
        }
      ) => {
        if (!pipelinesChanged || !pipelinesChanged.data) {
          return;
        }

        const { proccessId } = pipelinesChanged;

        if (proccessId === localStorage.getItem('proccessId')) {
          return;
        }

        if (document.querySelectorAll('.modal').length < 2) {
          this.props.detailQuery.refetch();
        }
      }
    });
  }

  componentWillUnmount() {
    this.unsubcribe();
  }

  addItem(doc: IItemParams, callback: () => void) {
    const { addMutation } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  copyItem(itemId: string, callback: () => void) {
    const { copyMutation, onAdd, options, stageId } = this.props;

    const proccessId = Math.random().toString();

    localStorage.setItem('proccessId', proccessId);

    copyMutation({ variables: { _id: itemId, proccessId } })
      .then(({ data }) => {
        callback();

        if (onAdd) {
          onAdd(stageId, data[options.mutationsName.copyMutation], itemId);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  saveItem = (doc: IItemParams, callback: (item) => void) => {
    const { itemId, editMutation, options } = this.props;

    const proccessId = Math.random().toString();

    localStorage.setItem('proccessId', proccessId);

    doc.proccessId = proccessId;

    editMutation({ variables: { _id: itemId, ...doc } })
      .then(({ data }) => {
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

          if (options.texts.deleteSuccessText) {
            Alert.success(options.texts.deleteSuccessText);
          }

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

  updateTimeTrack = (
    doc: { _id: string; status: string; timeSpent: number },
    callback?
  ) => {
    const { options } = this.props;

    client
      .mutate({
        variables: doc,
        mutation: gql(options.mutations.updateTimeTrackMutation)
      })
      .then(() => {
        if (callback) {
          callback();
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { usersQuery, detailQuery, options } = this.props;

    if (usersQuery.loading || detailQuery.loading) {
      return <Spinner />;
    }

    if (detailQuery.error) {
      return <ErrorMsg>{detailQuery.error.message}</ErrorMsg>;
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
      copyItem: this.copyItem,
      updateTimeTrack: this.updateTimeTrack,
      users
    };

    const EditForm = options.EditForm;

    return <EditForm {...extendedProps} />;
  }
}

const withQuery = (props: ContainerProps) => {
  const { options } = props;

  const refetchOptions = ({ stageId }: { stageId: string }) => ({
    refetchQueries: [
      {
        query: gql(queries.stageDetail),
        variables: { _id: stageId }
      }
    ]
  });

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
          options: refetchOptions
        }
      ),
      graphql<ContainerProps, SaveMutation, IItemParams>(
        gql(options.mutations.copyMutation),
        {
          name: 'copyMutation',
          options: refetchOptions
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
          options: refetchOptions
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
            options={props.options || options}
          />
        );
      }}
    </PipelineConsumer>
  );
};
