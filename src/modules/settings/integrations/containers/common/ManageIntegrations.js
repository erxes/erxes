import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ManageIntegrations } from 'modules/settings/integrations/components/common';
import { queries } from 'modules/settings/integrations/graphql';

class ManageIntegrationsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  render() {
    const { allIntegrationsQuery, save } = this.props;

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
      save,
      clearState,
      perPage: this.state.perPage,
      allIntegrations: allIntegrationsQuery.integrations || []
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

ManageIntegrationsContainer.propTypes = {
  current: PropTypes.object,
  allIntegrationsQuery: PropTypes.object,
  save: PropTypes.func
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'allIntegrationsQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  })
)(ManageIntegrationsContainer);
