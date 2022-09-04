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
import { IPaymentConfig, IPaymentConfigDocument } from '../types';
import { ButtonMutate, WithPermission } from '@erxes/ui/src/components';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations } from '../graphql';

type Props = {
  _id?: string;
  paymentConfig: IPaymentConfigDocument;
  removePaymentConfig: (paymentConfig: IPaymentConfigDocument) => void;
  // archive: (id: string, status: boolean) => void;
  // disableAction?: boolean;
  // editPaymentConfig: (
  //   id: string,
  //   { name, config }: IPaymentConfigVariables
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

  renderRemoveAction() {
    const { paymentConfig, removePaymentConfig } = this.props;

    console.log('renderRemoveAction: ', paymentConfig, removePaymentConfig);

    if (!removePaymentConfig) {
      return null;
    }

    const onClick = () => removePaymentConfig(paymentConfig);

    return (
      // <WithPermission action="paymentConfigRemove">
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
      // </WithPermission>
    );
  }

  renderEditAction() {
    const { paymentConfig } = this.props;
    const { type } = paymentConfig;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.paymentConfigsEdit}
          variables={values}
          callback={callback}
          // refetchQueries={getRefetchQueries(this.props.kind)}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully edited a`) + `${name}`}
        />
      );
    };

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    let content = props => (
      <QpayForm
        {...props}
        paymentConfig={paymentConfig}
        renderButton={renderButton}
      />
    );

    if (type.toLowerCase().includes('social')) {
      content = props => (
        <SocialPayForm
          {...props}
          paymentConfig={paymentConfig}
          renderButton={renderButton}
        />
      );
    }

    return (
      // <WithPermission action="integrationsEdit">
      <ActionButtons>
        <ModalTrigger
          title="Edit config"
          trigger={editTrigger}
          content={content}
        />
      </ActionButtons>
      // </WithPermission>
    );
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
            {this.renderEditAction()}
            {this.renderRemoveAction()}
            {/* {this.renderArchiveAction()} */}
            {/* {this.renderUnarchiveAction()} */}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
