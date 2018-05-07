import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { ManageIntegration } from '../components';
import { Alert } from 'modules/common/utils';

class FormContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };

    this.saveChannel = this.saveChannel.bind(this);
    this.saveBrand = this.saveBrand.bind(this);
  }

  saveChannel(integrationIds) {
    const { current, editMutation } = this.props;

    editMutation({
      variables: {
        _id: current._id,
        name: current.name,
        integrationIds,
        memberIds: current.memberIds
      }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  saveBrand(integrationIds) {
    const { current, manageIntegrations } = this.props;

    manageIntegrations({
      variables: {
        _id: current._id,
        integrationIds
      }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  render() {
    const { allIntegrationsQuery, type } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }
      this.setState({ perPage: this.state.perPage + 20 }, () => {
        allIntegrationsQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      });
    };

    const clearState = () => {
      allIntegrationsQuery.refetch({ searchValue: '' });
    };

    const updatedProps = {
      ...this.props,
      search,
      save: type === 'channel' ? this.saveChannel : this.saveBrand,
      clearState,
      perPage: this.state.perPage,
      refetch: allIntegrationsQuery.refetch,
      allIntegrations: allIntegrationsQuery.integrations || []
    };

    return <ManageIntegration {...updatedProps} />;
  }
}

FormContainer.propTypes = {
  current: PropTypes.object,
  type: PropTypes.string,
  allIntegrationsQuery: PropTypes.object,
  editMutation: PropTypes.func,
  manageIntegrations: PropTypes.func
};

FormContainer.defaultProps = {
  type: 'channel'
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'allIntegrationsQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  graphql(gql(mutations.channelEdit), {
    name: 'editMutation',
    options: ({ current }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              channelId: current._id,
              perPage: 20
            }
          },
          {
            query: gql(queries.channelDetail),
            variables: { _id: current._id }
          },
          {
            query: gql(queries.integrationsCount),
            variables: { channelId: current._id }
          }
        ]
      };
    }
  }),
  graphql(gql(mutations.brandManageIntegrations), {
    name: 'manageIntegrations',
    options: ({ current }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              brandId: current._id,
              perPage: 20
            }
          },
          {
            query: gql(queries.brandDetail),
            variables: { _id: current._id }
          },
          {
            query: gql(queries.integrationsCount),
            variables: { brandId: current._id }
          }
        ]
      };
    }
  })
)(FormContainer);
