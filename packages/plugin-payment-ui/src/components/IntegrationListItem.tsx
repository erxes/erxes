import { Alert, getEnv } from '@erxes/ui/src/utils';
import {
  IIntegration,
  IntegrationMutationVariables
} from '@erxes/ui-inbox/src/settings/integrations/types';
import {
  INTEGRATION_KINDS,
  WEBHOOK_DOC_URL
} from '@erxes/ui/src/constants/integrations';

import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
// import CommonFieldForm from './CommonFieldForm';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { IPaymentConfig } from '../types';

type Props = {
  _id?: string;
  paymentConfig: IPaymentConfig;
  // archive: (id: string, status: boolean) => void;
  // removeIntegration: (integration: IIntegration) => void;
  // disableAction?: boolean;
  // editIntegration: (
  //   id: string,
  //   { name, brandId, channelIds }: IntegrationMutationVariables
  // ) => void;
};

type State = {
  externalData: any;
};

class IntegrationListItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      externalData: null
    };
  }

  // renderArchiveAction() {
  //   const { paymentConfig } = this.props;

  //   if (!archive || disableAction || !integration.isActive) {
  //     return null;
  //   }

  //   const onClick = () => archive(integration._id, true);

  //   return (
  //     <WithPermission action="integrationsArchive">
  //       <Tip text={__('Archive')} placement="top">
  //         <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
  //       </Tip>
  //     </WithPermission>
  //   );
  // }

  // renderUnarchiveAction() {
  //   const { archive, integration, disableAction } = this.props;

  //   if (!archive || disableAction || integration.isActive) {
  //     return null;
  //   }

  //   const onClick = () => archive(integration._id, false);

  //   return (
  //     <WithPermission action="integrationsArchive">
  //       <Tip text={__('Unarchive')} placement="top">
  //         <Button btnStyle="link" onClick={onClick} icon="redo" />
  //       </Tip>
  //     </WithPermission>
  //   );
  // }

  // renderEditAction() {
  //   const { integration, editIntegration } = this.props;

  //   if (integration.kind === INTEGRATION_KINDS.MESSENGER) {
  //     return null;
  //   }

  //   const editTrigger = (
  //     <Button btnStyle="link">
  //       <Tip text="Edit" placement="top">
  //         <Icon icon="edit-3" />
  //       </Tip>
  //     </Button>
  //   );

  //   const content = props => (
  //     <CommonFieldForm
  //       {...props}
  //       onSubmit={editIntegration}
  //       name={integration.name}
  //       brandId={integration.brandId}
  //       channelIds={integration.channels.map(item => item._id) || []}
  //       integrationId={integration._id}
  //       integrationKind={integration.kind}
  //       webhookData={integration.webhookData}
  //     />
  //   );

  //   return (
  //     <WithPermission action="integrationsEdit">
  //       <ActionButtons>
  //         <ModalTrigger
  //           title="Edit integration"
  //           trigger={editTrigger}
  //           content={content}
  //         />
  //       </ActionButtons>
  //     </WithPermission>
  //   );
  // }

  // renderRemoveAction() {
  //   const { integration, removeIntegration, disableAction } = this.props;

  //   if (!removeIntegration || disableAction) {
  //     return null;
  //   }

  //   const onClick = () => removeIntegration(integration);

  //   return (
  //     <WithPermission action="integrationsRemove">
  //       <Tip text={__('Delete')} placement="top">
  //         <Button btnStyle="link" onClick={onClick} icon="times-circle" />
  //       </Tip>
  //     </WithPermission>
  //   );
  // }

  // renderRepairAction() {
  //   const { repair, integration } = this.props;

  //   if (!integration.kind.includes('facebook')) {
  //     return null;
  //   }

  //   const onClick = () => repair(integration._id);

  //   if (
  //     integration.healthStatus &&
  //     integration.healthStatus.status === 'account-token'
  //   ) {
  //     const editTrigger = (
  //       <Button btnStyle="link">
  //         <Tip text={__('Repair')} placement="top">
  //           <Icon icon="refresh" />
  //         </Tip>
  //       </Button>
  //     );

  //     const content = props => <RefreshPermissionForm {...props} />;

  //     return (
  //       <ActionButtons>
  //         <ModalTrigger
  //           title="Edit integration"
  //           trigger={editTrigger}
  //           content={content}
  //         />
  //       </ActionButtons>
  //     );
  //   } else {
  //     return (
  //       <Tip text={__('Repair')} placement="top">
  //         <Button btnStyle="link" onClick={onClick} icon="refresh" />
  //       </Tip>
  //     );
  //   }
  // }

  // renderExternalData(integration) {
  //   const { externalData } = this.state;
  //   const { kind } = integration;
  //   let value = '';

  //   if (!this.props.showExternalInfo) {
  //     return null;
  //   }

  //   if (!externalData) {
  //     return <td>No data</td>;
  //   }

  //   switch (kind) {
  //     case INTEGRATION_KINDS.CALLPRO:
  //       value = externalData.phoneNumber;
  //       break;
  //     case INTEGRATION_KINDS.TELNYX:
  //       value = externalData.telnyxPhoneNumber;
  //       break;
  //     default:
  //       break;
  //   }

  //   return <td>{value}</td>;
  // }

  // renderFetchAction(integration: IIntegration) {
  //   if (
  //     integration.kind === INTEGRATION_KINDS.MESSENGER ||
  //     integration.kind.includes('facebook')
  //   ) {
  //     return null;
  //   }

  //   const onClick = () => {
  //     client
  //       .query({
  //         query: gql(queries.integrationsGetIntegrationDetail),
  //         variables: {
  //           erxesApiId: integration._id
  //         }
  //       })
  //       .then(({ data }) => {
  //         this.setState({
  //           externalData: data.integrationsGetIntegrationDetail
  //         });
  //         this.props.showExternalInfoColumn();
  //       })
  //       .catch(e => {
  //         Alert.error(e.message);
  //       });
  //   };

  //   return (
  //     <Tip text={__('Fetch external data')} placement="top">
  //       <Button btnStyle="link" icon="download-1" onClick={onClick} />
  //     </Tip>
  //   );
  // }

  render() {
    const { paymentConfig } = this.props;
    const labelStyle = paymentConfig.status ? 'success' : 'danger';
    const status = paymentConfig.status ? __('Active') : __('Archived');

    return (
      <tr key={paymentConfig._id}>
        <td>{paymentConfig.name}</td>
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>

        <td>
          <ActionButtons>
            {/* {this.renderEditAction()} */}
            {/* {this.renderArchiveAction()} */}
            {/* {this.renderUnarchiveAction()} */}
            {/* {this.renderRemoveAction()} */}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
