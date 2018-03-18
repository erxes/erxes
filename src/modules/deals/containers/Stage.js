import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Stage } from '../components';
import { queries, mutations } from '../graphql';
import { Spinner } from 'modules/common/components';

class StageContainer extends React.Component {
  render() {
    const { dealsQuery, addMutation, editMutation, stage } = this.props;

    if (dealsQuery.loading) {
      return <Spinner />;
    }

    const deals = dealsQuery.deals;

    if (this.context.dealsChange[stage._id]) {
      dealsQuery.refetch();
    }

    // create or update deal
    const saveDeal = (doc, callback, deal) => {
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
          Alert.success('Successfully saved!');

          dealsQuery.refetch();

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      ...this.props,
      deals,
      saveDeal
    };

    return <Stage {...extendedProps} />;
  }
}

const propTypes = {
  dealsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  stage: PropTypes.object
};

StageContainer.propTypes = propTypes;
StageContainer.contextTypes = {
  dealsChange: PropTypes.object
};

export default compose(
  graphql(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ stage }) => ({
      variables: {
        stageId: stage._id
      }
    })
  }),
  // mutation
  graphql(gql(mutations.dealsAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.dealsEdit), {
    name: 'editMutation'
  })
)(StageContainer);
