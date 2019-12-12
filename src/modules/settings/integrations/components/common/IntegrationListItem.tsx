import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import InstallCode from 'modules/settings/integrations/components/InstallCode';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { cleanIntegrationKind } from '../../containers/utils';
import { IIntegration } from '../../types';
import CommonFieldForm from './CommonFieldForm';

type Props = {
  integration: IIntegration;
  archive: (id: string) => void;
  removeIntegration: (integration: IIntegration) => void;
  editIntegration: (
    id: string,
    { name, brandId }: { name: string; brandId: string }
  ) => void;
};

class IntegrationListItem extends React.Component<Props> {
  renderArchiveAction() {
    const { archive, integration } = this.props;

    if (!archive) {
      return null;
    }

    const onClick = () => archive(integration._id);

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__('Archive')}>
          <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
        </Tip>
      </WithPermission>
    );
  }

  renderEditAction() {
    const { integration, editIntegration } = this.props;

    if (integration.kind === KIND_CHOICES.MESSENGER) {
      return null;
    }

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <CommonFieldForm
        {...props}
        onSubmit={editIntegration}
        name={integration.name}
        brandId={integration.brandId}
        integrationId={integration._id}
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
    const integrationKind = cleanIntegrationKind(integration.kind);

    return (
      <tr key={integration._id}>
        <td>{integration.name}</td>
        <td>
          <Label className={`label-${integrationKind}`}>
            {integrationKind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>
          <ActionButtons>
            {this.renderMessengerActions(integration)}
            {this.renderEditAction()}
            {this.renderArchiveAction()}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
