import gql from 'graphql-tag';
import { ModalTrigger } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { ManageIntegrations } from 'modules/settings/integrations/containers/common';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { queries as integQueries } from 'modules/settings/integrations/graphql';
import { IIntegration } from 'modules/settings/integrations/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import { BrandsManageIntegrationsMutationResponse, IBrandDoc } from '../types';
import { ChooseBrand } from './';

type Props = {
  currentBrand: IBrandDoc;
  queryParams: any;
};

type FinalProps = BrandsManageIntegrationsMutationResponse & Props;

class ManageIntegrationsContainer extends React.Component<FinalProps> {
  renderConfirm(integration: IIntegration, actionTrigger, icon, handleChange) {
    if (icon === 'add') {
      return null;
    }

    const onSave = () => handleChange(icon, integration);

    const content = props => (
      <ChooseBrand {...props} integration={integration} onSave={onSave} />
    );

    return (
      <ModalTrigger
        key={integration._id}
        title="Choose new brand"
        trigger={actionTrigger}
        content={content}
      />
    );
  }

  save = (integrationIds: string[]): Promise<any> => {
    const { currentBrand, saveMutation } = this.props;

    return saveMutation({
      variables: {
        _id: currentBrand._id,
        integrationIds
      }
    })
      .then(() => {
        Alert.success('You successfully managed an integration');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

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

export default withProps<Props>(
  compose(
    graphql<Props, BrandsManageIntegrationsMutationResponse, {}>(
      gql(mutations.brandManageIntegrations),
      {
        name: 'saveMutation',
        options: ({
          queryParams,
          currentBrand
        }: {
          queryParams: any;
          currentBrand: IBrandDoc;
        }) => {
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
      }
    )
  )(ManageIntegrationsContainer)
);
