import gql from 'graphql-tag';
import { queries as boardQueries } from 'modules/boards/graphql';
import { Spinner } from 'modules/common/components';
import { Alert, confirm, withProps } from 'modules/common/utils';
import {
  DealDetailQueryResponse,
  IDeal,
  IDealParams,
  RemoveDealMutation,
  SaveDealMutation
} from 'modules/deals/types';
import { invalidateCalendarCache } from 'modules/deals/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { EditForm } from '../../components/editForm';
import { mutations, queries } from '../../graphql';

type Props = {
  type: string;
  itemId: string;
  stageId: string;
  onAdd?: (stageId: string, deal: IDeal) => void;
  onRemove?: (itemId: string, stageId: string) => void;
  onUpdate?: (deal: IDeal, prevStageId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  dealDetailQuery: DealDetailQueryResponse;
  usersQuery: UsersQueryResponse;
  // Using this mutation to copy deal in edit form
  addMutation: SaveDealMutation;
  editMutation: SaveDealMutation;
  removeMutation: RemoveDealMutation;
} & Props;

class EditFormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.saveItem = this.saveItem.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
  }

  addItem(
    doc: IDealParams,
    callback: () => void,
    msg = `You successfully added a deal`
  ) {
    const { onAdd, addMutation, stageId } = this.props;

    addMutation({ variables: doc })
      .then(({ data: { dealsAdd } }) => {
        Alert.success(msg);

        callback();

        if (onAdd) {
          onAdd(stageId, dealsAdd);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  saveItem = (doc: IDealParams, callback: () => void) => {
    const { stageId, itemId, editMutation, onUpdate } = this.props;

    editMutation({ variables: { _id: itemId, ...doc } })
      .then(({ data }) => {
        Alert.success('You successfully updated a deal');

        callback();

        if (onUpdate) {
          invalidateCalendarCache();

          onUpdate(data.dealsEdit, stageId);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  removeDeal = (itemId: string, callback) => {
    const { removeMutation, onRemove, stageId } = this.props;

    confirm().then(() =>
      removeMutation({ variables: { _id: itemId } })
        .then(() => {
          callback();

          Alert.success('You successfully deleted a deal');

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
    const { usersQuery, dealDetailQuery } = this.props;

    if (usersQuery.loading || dealDetailQuery.loading) {
      return <Spinner />;
    }

    const users = usersQuery.users;
    const deal = dealDetailQuery.dealDetail;

    if (!deal) {
      return null;
    }

    const extendedProps = {
      ...this.props,
      deal,
      addItem: this.addItem,
      removeDeal: this.removeDeal,
      saveItem: this.saveItem,
      users
    };

    return <EditForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, DealDetailQueryResponse, { _id: string }>(
      gql(queries.dealDetail),
      {
        name: 'dealDetailQuery',
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
    graphql<Props, SaveDealMutation, IDealParams>(gql(mutations.dealsAdd), {
      name: 'addMutation',
      options: ({ stageId }: { stageId: string }) => ({
        refetchQueries: [
          {
            query: gql(boardQueries.stageDetail),
            variables: { _id: stageId }
          }
        ]
      })
    }),
    graphql<Props, SaveDealMutation, IDealParams>(gql(mutations.dealsEdit), {
      name: 'editMutation',
      options: ({ itemId, stageId }: { stageId: string; itemId: string }) => ({
        refetchQueries: [
          {
            query: gql(queries.dealDetail),
            variables: { _id: itemId }
          },
          {
            query: gql(boardQueries.stageDetail),
            variables: { _id: stageId }
          }
        ]
      })
    }),
    graphql<Props, RemoveDealMutation, { _id: string }>(
      gql(mutations.dealsRemove),
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
