import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import InstallCode from 'modules/settings/integrations/components/InstallCode';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { IIntegration } from '../../types';

type Props = {
  integrations: IIntegration[];
  removeIntegration: (integration: IIntegration, callback?: any) => void;
};

class IntegrationList extends React.Component<Props> {
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

    if (kind === KIND_CHOICES.NYLAS_GMAIL) {
      return 'nylas gmail';
    }

    return 'default';
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

  renderRemoveAction(integration) {
    const { removeIntegration } = this.props;

    if (!removeIntegration) {
      return null;
    }

    const onClick = () => removeIntegration(integration);

    return (
      <Tip text={__('Delete')}>
        <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
      </Tip>
    );
  }

  renderRow(integration) {
    return (
      <tr key={integration._id}>
        <td>{integration.name}</td>
        <td>
          <Label className={`label-${this.getTypeName(integration)}`}>
            {integration.kind}
          </Label>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>
          <ActionButtons>
            {this.renderMessengerActions(integration)}
            {this.renderRemoveAction(integration)}
          </ActionButtons>
        </td>
      </tr>
    );
  }

  render() {
    const { integrations } = this.props;

    if (!integrations || integrations.length < 1) {
      return (
        <EmptyState
          text="Start adding integrations now!"
          image="/images/actions/2.svg"
        />
      );
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Kind')}</th>
            <th>{__('Brand')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{integrations.map(i => this.renderRow(i))}</tbody>
      </Table>
    );
  }
}

export default IntegrationList;
