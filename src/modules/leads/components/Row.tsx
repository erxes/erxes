import dayjs from 'dayjs';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import { Date } from 'modules/customers/styles';
import { RowTitle } from 'modules/engage/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { ILeadIntegration } from '../types';
import Manage from './Manage';

type Props = {
  integration: ILeadIntegration;
  isChecked: boolean;
  toggleBulk: (integration: ILeadIntegration, checked: boolean) => void;
  remove: (integrationId: string) => void;
  archive: (integrationId: string) => void;
};

class Row extends React.Component<Props> {
  manageAction(integration) {
    const { formId } = integration;

    return (
      <Link to={`/leads/edit/${integration._id}/${formId}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')}>
            <Icon icon="edit" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderEditAction(integration) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Install code')}>
          <Icon icon="copy" />
        </Tip>
      </Button>
    );

    const content = props => <Manage integration={integration} {...props} />;

    return (
      <ModalTrigger
        title="Install code"
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  }

  renderArchiveAction() {
    const { integration, archive } = this.props;

    const onClick = () => archive(integration._id);

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__('Archive')}>
          <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
        </Tip>
      </WithPermission>
    );
  }

  renderRemoveAction() {
    const { integration, remove } = this.props;

    const onClick = () => remove(integration._id);

    return (
      <WithPermission action="integrationsRemove">
        <Tip text={__('Delete')}>
          <Button btnStyle="link" onClick={onClick} icon="cancel-1" />
        </Tip>
      </WithPermission>
    );
  }

  render() {
    const { integration, isChecked, toggleBulk } = this.props;
    const form = integration.form;
    const lead = integration.leadData;

    const createdUser = form.createdUser || {
      _id: '',
      details: { fullName: '' }
    };
    const tags = integration.tags;

    let percentage: string | number = '0.00';

    if (lead.contactsGathered && lead.viewCount) {
      percentage = (lead.contactsGathered / lead.viewCount) * 100;
      percentage = percentage.toString();
    }

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(integration, e.target.checked);
      }
    };

    return (
      <tr>
        <td>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>
          <RowTitle>
            <Link to={`/leads/edit/${integration._id}/${integration.formId}`}>
              {integration.name}
            </Link>
          </RowTitle>
        </td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>{lead.viewCount || 0}</td>
        <td>{percentage.substring(0, 4)} %</td>
        <td>
          <Tip text={__('View')}>
            <Link to={`/contacts/customers/all?form=${integration.formId}`}>
              <Icon icon="eye-2" />
            </Link>
          </Tip>{' '}
          {lead.contactsGathered || 0}
        </td>
        <td>
          <Date>{dayjs(form.createdDate).format('ll')}</Date>
        </td>
        <td>
          <div key={createdUser._id}>
            {createdUser.details && createdUser.details.fullName}
          </div>
        </td>
        <td>
          <Tags tags={tags} limit={2} />
        </td>
        <td>
          <ActionButtons>
            {this.manageAction(integration)}
            {this.renderEditAction(integration)}
            {this.renderArchiveAction()}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
