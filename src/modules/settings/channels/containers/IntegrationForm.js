import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { IntegrationForm } from '../components';
import { Alert } from 'modules/common/utils';

class FormContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const { currentChannel, allIntegrationsQuery, editMutation } = this.props;

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

    const save = integrationIds => {
      editMutation({
        variables: {
          _id: currentChannel._id,
          name: currentChannel.name,
          integrationIds,
          memberIds: currentChannel.memberIds
        }
      })
        .then(() => {
          Alert.success('Successfully saved');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      search,
      save,
      clearState,
      perPage: this.state.perPage,
      allIntegrations: allIntegrationsQuery.integrations || []
    };

    return <IntegrationForm {...updatedProps} />;
  }
}

FormContainer.propTypes = {
  currentChannel: PropTypes.object,
  allIntegrationsQuery: PropTypes.object,
  editMutation: PropTypes.func
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
    options: ({ currentChannel }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              channelId: currentChannel._id,
              perPage: 20
            }
          },
          {
            query: gql(queries.channelDetail),
            variables: { _id: currentChannel._id }
          }
        ]
      };
    }
  })
)(FormContainer);
