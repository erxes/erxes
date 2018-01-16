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
    const {
      integrations,
      channelDetail,
      allIntegrationsQuery,
      refetch,
      editMutation
    } = this.props;

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

    const save = integrationIds => {
      editMutation({
        variables: {
          _id: channelDetail._id,
          name: channelDetail.name,
          integrationIds,
          memberIds: channelDetail.memberIds
        }
      })
        .then(() => {
          refetch();
          Alert.success('Successfully saved');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      search,
      channel: channelDetail,
      integrations,
      save,
      perPage: this.state.perPage,
      allIntegrations: allIntegrationsQuery.integrations || []
    };

    return <IntegrationForm {...updatedProps} />;
  }
}

FormContainer.propTypes = {
  integrations: PropTypes.array.isRequired,
  channelDetail: PropTypes.object.isRequired,
  allIntegrationsQuery: PropTypes.object,
  refetch: PropTypes.func.isRequired,
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
    name: 'editMutation'
  })
)(FormContainer);
