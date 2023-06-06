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
import CommonFieldForm from './CommonFieldForm';
import { INTEGRATIONS_COLORS } from '../../integrationColors';
import Icon from '@erxes/ui/src/components/Icon';
import InstallCode from '../InstallCode';
import Label from '@erxes/ui/src/components/Label';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import RefreshPermissionForm from '../facebook/RefreshPermission';
import Tip from '@erxes/ui/src/components/Tip';
import WithPermission from 'coreui/withPermission';
import { __ } from '@erxes/ui/src/utils';
import { cleanIntegrationKind } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../../graphql/index';

type Props = {
  _id?: string;
  integration: IIntegration;
  archive: (id: string, status: boolean) => void;
  repair: (id: string, kind: string) => void;
  removeIntegration: (integration: IIntegration) => void;
  disableAction?: boolean;
  editIntegration: (
    id: string,
    { name, brandId, channelIds }: IntegrationMutationVariables
  ) => void;
  showExternalInfoColumn: () => void;
  showExternalInfo: boolean;
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

  renderArchiveAction() {
    const { archive, integration, disableAction } = this.props;

    if (!archive || disableAction || !integration.isActive) {
      return null;
    }

    const onClick = () => archive(integration._id, true);

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__('Archive')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
        </Tip>
      </WithPermission>
    );
  }

  renderUnarchiveAction() {
    const { archive, integration, disableAction } = this.props;

    if (!archive || disableAction || integration.isActive) {
      return null;
    }

    const onClick = () => archive(integration._id, false);

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__('Unarchive')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="redo" />
        </Tip>
      </WithPermission>
    );
  }

  renderGetAction() {
    const { integration } = this.props;
    const webhookData = integration.webhookData;

    if (!webhookData) {
      return;
    }

    const showTrigger = (
      <Button btnStyle="link">
        <Tip text="Show" placement="top">
          <Icon icon="eye" />
        </Tip>
      </Button>
    );

    const content = () => {
      const { REACT_APP_API_URL } = getEnv();

      return (
        <div>
          <b>Name</b>: {integration.name} <br />
          <div>
            <b>URL</b>: {REACT_APP_API_URL}/webhooks/{integration._id} <br />
            <b>Token</b>: {webhookData.token}
          </div>
          <p>
            {'For more information, please review the '}
            <a target="_blank" rel="noopener noreferrer" href={WEBHOOK_DOC_URL}>
              documentaion.
            </a>
          </p>
        </div>
      );
    };

    return (
      <WithPermission action="showIntegrations">
        <ActionButtons>
          <ModalTrigger
            title="Integration detail"
            trigger={showTrigger}
            content={content}
          />
        </ActionButtons>
      </WithPermission>
    );
  }

  renderEditAction() {
    const { integration, editIntegration } = this.props;

    if (integration.kind === INTEGRATION_KINDS.MESSENGER) {
      return null;
    }

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => (
      <CommonFieldForm
        {...props}
        onSubmit={editIntegration}
        name={integration.name}
        brandId={integration.brandId}
        channelIds={integration.channels.map(item => item._id) || []}
        integrationId={integration._id}
        integrationKind={integration.kind}
        webhookData={integration.webhookData}
      />
    );

    return (
      <WithPermission action="integrationsEdit">
        <ActionButtons>
          <ModalTrigger
            title="Edit integration"
            trigger={editTrigger}
            content={content}
          />
        </ActionButtons>
      </WithPermission>
    );
  }

  renderMessengerActions(integration) {
    const kind = integration.kind;

    if (kind === INTEGRATION_KINDS.MESSENGER) {
      const editTrigger = (
        <Button btnStyle="link">
          <Tip text="Install code" placement="top">
            <Icon icon="code" />
          </Tip>
        </Button>
      );

      const content = props => (
        <InstallCode {...props} integration={integration} />
      );

      return (
        <ActionButtons>
          <Tip text={__('Edit messenger integration')} placement="top">
            <Link
              to={`/settings/integrations/editMessenger/${integration._id}`}
            >
              <Button btnStyle="link" icon="edit-3" />
            </Link>
          </Tip>

          <ModalTrigger
            isOpen={this.props._id === integration._id}
            title="Install code"
            size="lg"
            trigger={editTrigger}
            content={content}
          />
        </ActionButtons>
      );
    }

    return null;
  }

  renderRemoveAction() {
    const { integration, removeIntegration, disableAction } = this.props;

    if (!removeIntegration || disableAction) {
      return null;
    }

    const onClick = () => removeIntegration(integration);

    return (
      <WithPermission action="integrationsRemove">
        <Tip text={__('Delete')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="times-circle" />
        </Tip>
      </WithPermission>
    );
  }

  renderRepairAction() {
    const { repair, integration } = this.props;

    if (!integration.kind.includes('facebook')) {
      return null;
    }

    const onClick = () => repair(integration._id, integration.kind);

    if (
      integration.healthStatus &&
      integration.healthStatus.status === 'account-token'
    ) {
      const editTrigger = (
        <Button btnStyle="link">
          <Tip text={__('Repair')} placement="top">
            <Icon icon="refresh" />
          </Tip>
        </Button>
      );

      const content = props => <RefreshPermissionForm {...props} />;

      return (
        <ActionButtons>
          <ModalTrigger
            title="Edit integration"
            trigger={editTrigger}
            content={content}
          />
        </ActionButtons>
      );
    } else {
      return (
        <Tip text={__('Repair')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="refresh" />
        </Tip>
      );
    }
  }

  renderExternalData(integration) {
    const { externalData } = this.state;
    const { kind } = integration;
    let value = '';

    if (!this.props.showExternalInfo) {
      return null;
    }

    if (!externalData) {
      return <td>No data</td>;
    }

    switch (kind) {
      case INTEGRATION_KINDS.CALLPRO:
        value = externalData.phoneNumber;
        break;
      case INTEGRATION_KINDS.TELNYX:
        value = externalData.telnyxPhoneNumber;
        break;
      default:
        break;
    }

    return <td>{value}</td>;
  }

  renderFetchAction(integration: IIntegration) {
    if (
      integration.kind === INTEGRATION_KINDS.MESSENGER ||
      integration.kind.includes('facebook')
    ) {
      return null;
    }

    const onClick = () => {
      client
        .query({
          query: gql(queries.integrationsGetIntegrationDetail),
          variables: {
            erxesApiId: integration._id
          }
        })
        .then(({ data }) => {
          this.setState({
            externalData: data.integrationsGetIntegrationDetail
          });
          this.props.showExternalInfoColumn();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    return (
      <Tip text={__('Fetch external data')} placement="top">
        <Button btnStyle="link" icon="download-1" onClick={onClick} />
      </Tip>
    );
  }

  render() {
    const { integration } = this.props;
    const integrationKind = cleanIntegrationKind(integration.kind);

    const healthStatus = integration.healthStatus
      ? integration.healthStatus.status
      : '';

    const error = integration.healthStatus
      ? integration.healthStatus.error
      : '';

    const labelStyle = integration.isActive ? 'success' : 'danger';
    const status = integration.isActive ? __('Active') : __('Archived');
    const labelStyleHealthy = healthStatus === 'healthy' ? 'success' : 'danger';
    const healthStatusText =
      healthStatus === 'healthy' ? __('Healthy') : __('Unhealthy');

    return (
      <tr key={integration._id}>
        <td>{integration.name}</td>
        <td>
          <Label lblColor={INTEGRATIONS_COLORS[integrationKind]}>
            {integrationKind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>
        <td>
          <Tip text={error}>
            <Label lblStyle={labelStyleHealthy}>{healthStatusText}</Label>
          </Tip>
        </td>
        {this.renderExternalData(integration)}
        <td>
          <ActionButtons>
            {this.renderFetchAction(integration)}
            {this.renderMessengerActions(integration)}
            {this.renderGetAction()}
            {this.renderRepairAction()}
            {this.renderEditAction()}
            {this.renderArchiveAction()}
            {this.renderUnarchiveAction()}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
