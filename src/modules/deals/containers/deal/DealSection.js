import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { DealSection } from '../../components';
import { saveDeal as save, removeDeal as remove } from '../../utils';

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

    save(
      doc,
      { addMutation, editMutation, dealsQuery },
      { __ },
      () => {
        callback();
      },
      deal
    );
  }

  // remove deal
  removeDeal(_id, callback) {
    const { removeMutation, dealsQuery } = this.props;
    const { __ } = this.context;

    remove(_id, { removeMutation, dealsQuery }, { __ }, callback);
  }

  render() {
    const { dealsQuery } = this.props;

    if (dealsQuery.loading) {
      return null;
    }

    const deals = dealsQuery.deals || [];

    const extendedProps = {
      ...this.props,
      deals,
      saveDeal: this.saveDeal,
      removeDeal: this.removeDeal
    };

    return <DealSection {...extendedProps} />;
  }
}

DealSectionContainer.propTypes = {
  deals: PropTypes.array,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func,
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
    options: ({ customerId = '', companyId = '' }) => ({
      variables: {
        customerId,
        companyId
      }
    })
  })
)(DealSectionContainer);
