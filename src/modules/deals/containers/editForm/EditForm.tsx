import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { EditForm } from '../../components/editForm';
import { mutations, queries } from '../../graphql';
import { IDealParams } from '../../types';

type Props = {
  dealId: string;
  stageId: string;
  dealDetailQuery: any;
  usersQuery: any;
  // Using this mutation to copy deal in edit form
  addMutation: (params: { variables: IDealParams }) => Promise<any>;
  editMutation: (params: { variables: IDealParams }) => Promise<any>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
  onRemove: (_id: string, stageId: string) => void;
  closeModal: () => void;
};

class EditFormContainer extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.addDeal = this.addDeal.bind(this);
    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
  }

  addDeal(doc: IDealParams, callback: () => void) {
    const { addMutation } = this.props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success(__('Successfully saved.'));
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  saveDeal(doc: IDealParams, callback: () => void) {
    const { dealId, editMutation } = this.props;

    editMutation({ variables: { _id: dealId, ...doc } })
      .then(() => {
        Alert.success(__('Successfully saved.'));
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  removeDeal(_id: string, callback) {
    const { removeMutation, onRemove, stageId } = this.props;

    confirm().then(() =>
      removeMutation({ variables: { _id } })
        .then(() => {
          callback();

          onRemove(_id, stageId);
        })

        .catch(error => {
          Alert.error(error.message);
        })
    );
  }

  render() {
    const { usersQuery, dealDetailQuery } = this.props;

    if (usersQuery.loading || dealDetailQuery.loading) {
      return <Spinner />;
    }

    const users = usersQuery.users;
    const deal = dealDetailQuery.dealDetail;

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

export default compose(
  graphql(gql(queries.dealDetail), {
    name: 'dealDetailQuery',
    options: ({ dealId }: { dealId: string }) => {
      return {
        variables: {
          _id: dealId
        }
      };
    }
  }),
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation',
    options: ({ stageId }: { stageId: string }) => ({
      refetchQueries: [
        {
          query: gql(queries.deals),
          variables: { stageId }
        }
      ]
    })
  })
)(EditFormContainer);
