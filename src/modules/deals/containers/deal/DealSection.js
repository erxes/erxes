import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries, mutations } from '../../graphql';
import { Alert, confirm } from 'modules/common/utils';
import { DealSection } from '../../components';

class DealSectionContainer extends React.Component {
  constructor(props) {
    super(props);

    this.saveDeal = this.saveDeal.bind(this);
    this.removeDeal = this.removeDeal.bind(this);
  }

  // create or update deal
  saveDeal(doc, callback, deal) {
    const { addMutation, editMutation, dealsQuery } = this.props;

    const { __ } = this.context;

    let mutation = addMutation;

    // if edit mode
    if (deal) {
      mutation = editMutation;
      doc._id = deal._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        Alert.success(__('Successfully saved.'));

        dealsQuery.refetch();

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  }

  // remove deal
  removeDeal(_id) {
    const { removeMutation, dealsQuery } = this.props;
    const { __ } = this.context;

    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
          Alert.success(__('Successfully deleted.'));

          dealsQuery.refetch();

          // callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  }

  render() {
    const { dealsQuery } = this.props;

    if (dealsQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...this.props,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal,
      deals: dealsQuery.deals
    };

    return <DealSection {...extendedProps} />;
  }
}

DealSectionContainer.propTypes = {
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
  dealsChangeMutation: PropTypes.func,
  dealsQuery: PropTypes.object
};

DealSectionContainer.contextTypes = {
  __: PropTypes.func
};

export default compose(
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.dealsRemove), {
    name: 'removeMutation'
  }),
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ customerId, companyId }) => ({
      variables: {
        customerId: customerId || '',
        companyId: companyId || ''
      }
    })
  })
)(DealSectionContainer);
