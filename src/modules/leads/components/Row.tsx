import dayjs from 'dayjs';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tags from 'modules/common/components/Tags';
import Tip from 'modules/common/components/Tip';
import { __, Alert, confirm } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { ILeadIntegration } from '../types';
import Manage from './Manage';

type Props = {
  integration: ILeadIntegration;

  toggleBulk: (integration: ILeadIntegration, checked: boolean) => void;
  remove: (integrationId: string, callback: (error: Error) => void) => void;

  isChecked: boolean;
};

class Row extends React.Component<Props, {}> {
  remove = () => {
    confirm()
      .then(() => {
        const { integration, remove } = this.props;

        remove(integration._id, error => {
          if (error) {
            return Alert.error(error.message);
          }

          return Alert.success('You successfully deleted a pop ups');
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

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
      <ModalTrigger title="Install code" trigger={trigger} content={content} />
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
        <td>{integration.name}</td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>{lead.viewCount || 0}</td>
        <td>{percentage.substring(0, 4)} %</td>
        <td>
          {lead.contactsGathered || 0}{' '}
          <Tip text={__('View')}>
            <Link to={`/contacts/customers/all?form=${integration.formId}`}>
              <Icon icon="eye" />
            </Link>
          </Tip>
        </td>
        <td>{dayjs(form.createdDate).format('ll')}</td>
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
            <Tip text={__('Delete')}>
              <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
