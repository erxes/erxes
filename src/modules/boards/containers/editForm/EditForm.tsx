import gql from 'graphql-tag';
import { queries as boardQueries } from 'modules/boards/graphql';
import { Spinner } from 'modules/common/components';
import { Alert, confirm } from 'modules/common/utils';
import { DealEditForm } from 'modules/deals/components';
import { invalidateCalendarCache } from 'modules/deals/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import { TicketEditForm } from 'modules/tickets/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { STAGE_CONSTANTS } from '../../constants';
import { mutations, queries } from '../../graphql';
import {
  DetailQueryResponse,
  Item,
  ItemParams,
  RemoveMutation,
  SaveMutation
} from '../../types';
import { withProps } from '../../utils';

type Props = {
  type: string;
  itemId: string;
  stageId: string;
  onAdd?: (stageId: string, item: Item) => void;
  onRemove?: (itemId: string, stageId: string) => void;
  onUpdate?: (item: Item, prevStageId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  detailQuery: DetailQueryResponse;
  usersQuery: UsersQueryResponse;
  // Using this mutation to copy item in edit form
  addMutation: SaveMutation;
  editMutation: SaveMutation;
  removeMutation: RemoveMutation;
} & Props;

class EditFormContainer extends React.Component<FinalProps> {
  private ITEMS;

  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.removeItem = this.removeItem.bind(this);

    this.ITEMS = {
      deal: DealEditForm,
      ticket: TicketEditForm
    };
  }

  addItem(
    doc: ItemParams,
    callback: () => void,
    msg = STAGE_CONSTANTS[this.props.type].addSuccessText
  ) {
    const { onAdd, addMutation, stageId, type } = this.props;
    const constant = STAGE_CONSTANTS[type];

    addMutation({ variables: doc })
      .then(({ data }) => {
        Alert.success(msg);

        callback();

        if (onAdd) {
          onAdd(stageId, data[constant.addMutation]);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  saveItem = (doc: ItemParams, callback: () => void) => {
    const { stageId, itemId, editMutation, onUpdate, type } = this.props;
    const constant = STAGE_CONSTANTS[type];

    editMutation({ variables: { _id: itemId, ...doc } })
      .then(({ data }) => {
        Alert.success(constant.updateSuccessText);

        callback();

        if (onUpdate) {
          invalidateCalendarCache();

          onUpdate(data[constant.editMutation], stageId);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  removeItem = (itemId: string, callback) => {
    const { removeMutation, onRemove, stageId, type } = this.props;

    confirm().then(() =>
      removeMutation({ variables: { _id: itemId } })
        .then(() => {
          callback();

          Alert.success(STAGE_CONSTANTS[type].deleteSuccessText);

          if (onRemove) {
            invalidateCalendarCache();

            onRemove(itemId, stageId);
          }
        })

        .catch(error => {
          Alert.error(error.message);
        })
    );
  };

  render() {
    const { usersQuery, detailQuery, type } = this.props;

    if (usersQuery.loading || detailQuery.loading) {
      return <Spinner />;
    }

    const users = usersQuery.users;
    const item = detailQuery[STAGE_CONSTANTS[type].detailQuery];

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

    const EditForm = this.ITEMS[type];

    return <EditForm {...extendedProps} />;
  }
}

export default (props: Props) => {
  const { type } = props;

  return withProps<Props>(
    props,
    compose(
      graphql<Props, DetailQueryResponse, { _id: string }>(
        gql(queries[STAGE_CONSTANTS[type].detailQuery]),
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
      graphql<Props, UsersQueryResponse>(gql(userQueries.usersForSelector), {
        name: 'usersQuery'
      }),
      graphql<Props, SaveMutation, ItemParams>(
        gql(mutations[STAGE_CONSTANTS[type].addMutation]),
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
      graphql<Props, SaveMutation, ItemParams>(
        gql(mutations[STAGE_CONSTANTS[type].editMutation]),
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
                query: gql(queries[STAGE_CONSTANTS[type].detailQuery]),
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
      graphql<Props, RemoveMutation, { _id: string }>(
        gql(mutations[STAGE_CONSTANTS[type].removeMutation]),
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
