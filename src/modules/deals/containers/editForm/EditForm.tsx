import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UsersQueryResponse } from '../../../settings/team/types';
import { EditForm } from '../../components/editForm';
import { mutations, queries } from '../../graphql';
import {
  DealDetailQueryResponse,
  IDeal,
  IDealParams,
  RemoveDealMutation,
  SaveDealMutation
} from '../../types';

type Props = {
  dealId: string;
  stageId: string;
  onAdd?: (stageId: string, deal: IDeal) => void;
  onRemove?: (dealId: string, stageId: string) => void;
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

    this.addDeal = this.addDeal.bind(this);
    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
  }

  addDeal(doc: IDealParams, callback: () => void) {
    const { onAdd, addMutation, stageId } = this.props;

    addMutation({ variables: doc })
      .then(({ data: { dealsAdd } }) => {
        Alert.success(__('Successfully saved.'));

        callback();

        if (onAdd) {
          onAdd(stageId, dealsAdd);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  saveDeal = (doc: IDealParams, callback: () => void) => {
    const { stageId, dealId, editMutation, onUpdate } = this.props;

    editMutation({ variables: { _id: dealId, ...doc } })
      .then(({ data }) => {
        Alert.success(__('Successfully saved.'));

        callback();

        if (onUpdate) {
          onUpdate(data.dealsEdit, stageId);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  removeDeal = (dealId: string, callback) => {
    const { removeMutation, onRemove, stageId } = this.props;

    confirm().then(() =>
      removeMutation({ variables: { _id: dealId } })
        .then(() => {
          callback();

          if (onRemove) {
            onRemove(dealId, stageId);
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
      addDeal: this.addDeal,
      removeDeal: this.removeDeal,
      saveDeal: this.saveDeal,
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
        options: ({ dealId }: { dealId: string }) => {
          return {
            variables: {
              _id: dealId
            }
          };
        }
      }
    ),
    graphql<Props, UsersQueryResponse>(gql(queries.users), {
      name: 'usersQuery'
    }),
    graphql<Props, SaveDealMutation, IDealParams>(gql(mutations.dealsAdd), {
      name: 'addMutation',
      options: ({ stageId }: { stageId: string }) => ({
        refetchQueries: [
          {
            query: gql(queries.stageDetail),
            variables: { _id: stageId }
          }
        ]
      })
    }),
    graphql<Props, SaveDealMutation, IDealParams>(gql(mutations.dealsEdit), {
      name: 'editMutation',
      options: ({ dealId, stageId }: { stageId: string; dealId: string }) => ({
        refetchQueries: [
          {
            query: gql(queries.dealDetail),
            variables: { _id: dealId }
          },
          {
            query: gql(queries.stageDetail),
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
              query: gql(queries.stageDetail),
              variables: { _id: stageId }
            }
          ]
        })
      }
    )
  )(EditFormContainer)
);
