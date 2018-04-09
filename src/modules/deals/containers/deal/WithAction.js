import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import { Alert, confirm } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';

export default function WithAction(WrappedComponent, param) {
  const WithAction = class extends React.Component {
    constructor(props) {
      super(props);

      this.saveDeal = this.saveDeal.bind(this);
      this.removeDeal = this.removeDeal.bind(this);
      this.moveDeal = this.moveDeal.bind(this);
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
        .then(({ data }) => {
          Alert.success(__('Successfully saved.'));

          dealsQuery.refetch();

          callback(data);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }

    // remove deal
    removeDeal(_id, callback) {
      const { removeMutation, dealsQuery } = this.props;
      const { __ } = this.context;

      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(({ data: { dealsRemove } }) => {
            Alert.success(__('Successfully deleted.'));

            callback(dealsRemove);

            dealsQuery.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    }

    // move deal
    moveDeal(doc, callback) {
      const { dealsChangeMutation, dealsQuery } = this.props;
      const { __ } = this.context;

      dealsChangeMutation({
        variables: doc
      })
        .then(() => {
          Alert.success(__('Successfully moved.'));

          dealsQuery.refetch();

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
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
        moveDeal: this.moveDeal,
        deals: dealsQuery.deals
      };

      return <WrappedComponent {...extendedProps} />;
    }
  };

  WithAction.displayName = 'WithActionComponent';

  WithAction.propTypes = {
    addMutation: PropTypes.func,
    editMutation: PropTypes.func,
    removeMutation: PropTypes.func,
    dealsChangeMutation: PropTypes.func,
    dealsQuery: PropTypes.object
  };

  WithAction.contextTypes = {
    __: PropTypes.func
  };

  return compose(
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
      options: () => ({
        variables: {
          stageId: param.stageId || '',
          customerId: param.customerId || '',
          companyId: param.companyId || ''
        }
      })
    })
  )(WithAction);
}
