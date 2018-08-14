import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ModalTrigger } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { ManageIntegrations } from 'modules/settings/integrations/containers/common';
import { queries as integQueries } from 'modules/settings/integrations/graphql';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { queries, mutations } from '../graphql';
import { ChooseBrand } from './';

class ManageIntegrationsContainer extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  renderConfirm(integration, actionTrigger, icon, handleChange) {
    if (icon === 'add') {
      return null;
    }

    return (
      <ModalTrigger
        key={integration._id}
        title="Choose new brand"
        trigger={actionTrigger}
      >
        <ChooseBrand
          integration={integration}
          onSave={() => handleChange(icon, integration)}
        />
      </ModalTrigger>
    );
  }

  save(integrationIds) {
    const { currentBrand, saveMutation } = this.props;

    saveMutation({
      variables: {
        _id: currentBrand._id,
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
    const { currentBrand } = this.props;

    const updatedProps = {
      ...this.props,
      current: currentBrand,
      save: this.save,
      renderConfirm: this.renderConfirm
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

ManageIntegrationsContainer.propTypes = {
  currentBrand: PropTypes.object,
  saveMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.brandManageIntegrations), {
    name: 'saveMutation',
    options: ({ queryParams, currentBrand }) => {
      return {
        refetchQueries: [
          {
            query: gql(integQueries.integrations),
            variables: {
              brandId: currentBrand._id,
              ...integrationsListParams(queryParams)
            }
          },
          {
            query: gql(queries.brandDetail),
            variables: { _id: currentBrand._id }
          },
          {
            query: gql(queries.integrationsCount),
            variables: { brandId: currentBrand._id }
          }
        ]
      };
    }
  })
)(ManageIntegrationsContainer);
