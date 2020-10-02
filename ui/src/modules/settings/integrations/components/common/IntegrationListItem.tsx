import { getEnv } from 'apolloClient';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import InstallCode from 'modules/settings/integrations/components/InstallCode';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { cleanIntegrationKind } from '../../containers/utils';
import { INTEGRATIONS_COLORS } from '../../integrationColors';
import { IIntegration, IntegrationMutationVariables } from '../../types';
import CommonFieldForm from './CommonFieldForm';

type Props = {
  _id?: string;
  integration: IIntegration;
  archive: (id: string, status: boolean) => void;
  removeIntegration: (integration: IIntegration) => void;
  disableAction?: boolean;
  editIntegration: (
    id: string,
    { name, brandId, channelIds }: IntegrationMutationVariables
  ) => void;
};

class IntegrationListItem extends React.Component<Props> {
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

    const showTrigger = (
      <Button btnStyle="link">
        <Tip text="Show" placement="top">
          <Icon icon="eye" />
        </Tip>
      </Button>
    );

    const content = () => {
      const webhookData = integration.webhookData;
      const { REACT_APP_API_URL } = getEnv();

      return (
        <div>
          <b>Name</b>: {integration.name} <br />
          {webhookData && (
            <div>
              <b>URL</b>: {REACT_APP_API_URL}/webhooks/{integration._id} <br />
              <b>Token</b>: {webhookData.token}
            </div>
          )}
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

  render() {
    const { integration } = this.props;
    const integrationKind = cleanIntegrationKind(integration.kind);
    const labelStyle = integration.isActive ? 'success' : 'warning';
    const status = integration.isActive ? __('Active') : __('Archived');

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
          <ActionButtons>
            {this.renderMessengerActions(integration)}
            {this.renderGetAction()}
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
