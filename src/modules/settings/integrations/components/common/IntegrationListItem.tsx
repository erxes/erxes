import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import Toggle from 'modules/common/components/Toggle';
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import InstallCode from 'modules/settings/integrations/components/InstallCode';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { IIntegration } from '../../types';

type Props = {
  integration: IIntegration;
  toggleIntegration: (id: string, status: boolean) => void;
  removeIntegration: (integration: IIntegration) => void;
};

class IntegrationListItem extends React.Component<Props> {
  getTypeName(integration) {
    const kind = integration.kind;

    if (kind === KIND_CHOICES.FACEBOOK_MESSENGER) {
      return 'facebook messenger';
    }

    if (kind === KIND_CHOICES.FACEBOOK_POST) {
      return 'facebook post';
    }

    if (kind === KIND_CHOICES.GMAIL) {
      return 'gmail';
    }

    if (kind === KIND_CHOICES.LEAD) {
      return 'lead';
    }

    if (kind === KIND_CHOICES.CALLPRO) {
      return 'callpro';
    }

    if (kind === KIND_CHOICES.CHATFUEL) {
      return 'chatfuel';
    }

    if (kind === KIND_CHOICES.NYLAS_GMAIL) {
      return 'nylas gmail';
    }

    if (kind === KIND_CHOICES.TWITTER_DM) {
      return 'twitter';
    }

    if (kind === KIND_CHOICES.NYLAS_IMAP) {
      return 'nylas imap';
    }

    if (kind === KIND_CHOICES.NYLAS_OFFICE365) {
      return 'nylas office365';
    }

    if (kind === KIND_CHOICES.NYLAS_OUTLOOK) {
      return 'nylas outlook';
    }

    if (kind === KIND_CHOICES.NYLAS_YAHOO) {
      return 'nylas yahoo';
    }

    return 'default';
  }

  renderStatus() {
    const { toggleIntegration, integration } = this.props;

    if (!toggleIntegration) {
      return null;
    }

    let style: string = 'default';
    let label: React.ReactNode = __('Inactive');

    if (integration.isActive) {
      style = 'success';
      label = __('Active');
    }

    const onClick = e => toggleIntegration(integration._id, e.target.checked);
    const fallback = <Label lblStyle={style}>{label}</Label>;

    return (
      <WithPermission
        action="integrationsToggleStatus"
        fallbackComponent={fallback}
      >
        <Toggle
          defaultChecked={integration.isActive}
          onChange={onClick}
          icons={false}
        />
      </WithPermission>
    );
  }

  renderMessengerActions(integration) {
    const kind = integration.kind;

    if (kind === KIND_CHOICES.MESSENGER) {
      const editTrigger = (
        <Button btnStyle="link">
          <Tip text="Install code">
            <Icon icon="copy" />
          </Tip>
        </Button>
      );

      const content = props => (
        <InstallCode {...props} integration={integration} />
      );

      return (
        <ActionButtons>
          <Tip text={__('Edit messenger integration')}>
            <Link
              to={`/settings/integrations/editMessenger/${integration._id}`}
            >
              <Button btnStyle="link" icon="edit" />
            </Link>
          </Tip>

          <ModalTrigger
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
    const { integration, removeIntegration } = this.props;

    if (!removeIntegration) {
      return null;
    }

    const onClick = () => removeIntegration(integration);

    return (
      <WithPermission action="integrationsRemove">
        <Tip text={__('Delete')}>
          <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
        </Tip>
      </WithPermission>
    );
  }

  render() {
    const { integration } = this.props;

    return (
      <tr key={integration._id}>
        <td>{integration.name}</td>
        <td>
          <Label className={`label-${this.getTypeName(integration)}`}>
            {integration.kind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>{this.renderStatus()}</td>
        <td>
          <ActionButtons>
            {this.renderMessengerActions(integration)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
