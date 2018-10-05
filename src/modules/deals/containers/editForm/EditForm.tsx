import gql from 'graphql-tag';
import { __, Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { EditForm } from '../../components/editForm';
import { mutations, queries } from '../../graphql';
import { IDeal, IDealParams } from '../../types';
import { DealConsumer } from '../DealContext';

type Props = {
  usersQuery: any;
  deal: IDeal;
  // Using this mutation to copy deal in edit form
  addMutation: (params: { variables: IDealParams }) => Promise<any>;
  editMutation: (params: { variables: IDealParams }) => Promise<any>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
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
    const { deal, editMutation } = this.props;

    editMutation({ variables: { _id: deal._id, ...doc } })
      .then(() => {
        Alert.success(__('Successfully saved.'));
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  removeDeal(_id: string, callback) {
    const { removeMutation } = this.props;

    confirm().then(() => removeMutation({ variables: { _id } })
      .then(() => {
         callback();
      })
      .catch(error => {
        Alert.error(error.message);
      })
    );
  }

  render() {
    const { usersQuery, deal } = this.props;

    const extendedProps = {
      ...this.props,
      deal,
      addDeal: this.addDeal,
      removeDeal: this.removeDeal,
      saveDeal: this.saveDeal,
      users: usersQuery.users || []
    };

    return (
      <DealConsumer>
        {({ move }) => <EditForm { ...extendedProps} move={move} />}
      </DealConsumer>
    )
  }
}

export default compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation',
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation',
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation',
    options: ({ deal }: { deal: IDeal }) => ({
      refetchQueries: [{
        query: gql(queries.deals),
        variables: { stageId: deal.stageId }
      }]
    }),
  }),
)(EditFormContainer);
