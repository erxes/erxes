import dayjs from 'dayjs';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import Tip from '@erxes/ui/src/components/Tip';
import WithPermission from 'coreui/withPermission';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { Capitalize } from '@erxes/ui-settings/src/permissions/styles';
import { __, getEnv } from 'coreui/utils';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { ILeadIntegration } from '@erxes/ui-leads/src/types';
import Manage from './Manage';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  integration: ILeadIntegration;
  isChecked: boolean;
  toggleBulk: (integration: ILeadIntegration, checked: boolean) => void;
  remove: (integrationId: string) => void;
  archive: (integrationId: string, status: boolean) => void;
  copy: (integrationId: string) => void;
  showCode?: boolean;
};

class Row extends React.Component<Props> {
  manageAction(integration) {
    const { formId } = integration;

    return (
      <Link to={`/forms/edit/${integration._id}/${formId}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderEditAction(integration) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Install code')} placement="top">
          <Icon icon="code" />
        </Tip>
      </Button>
    );

    const content = props => <Manage integration={integration} {...props} />;

    return (
      <ModalTrigger
        title={`Install code of ${integration.name}`}
        size="lg"
        trigger={trigger}
        content={content}
        isOpen={this.props.showCode}
        isAnimate={true}
      />
    );
  }

  renderArchiveAction() {
    const { integration, archive } = this.props;

    const onClick = () => archive(integration._id, true);

    if (!archive || !integration.isActive) {
      return null;
    }

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__('Archive')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="archive-alt" />
        </Tip>
      </WithPermission>
    );
  }

  renderExportAction() {
    const { integration } = this.props;
    const { REACT_APP_API_URL } = getEnv();

    const onClick = () => {
      window.open(
        `${REACT_APP_API_URL}/pl:inbox/file-export?type=customer&popupData=true&form=${integration.formId}`,
        '_blank'
      );
    };

    return (
      <Tip text={__('Download responses')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="down-arrow" />
      </Tip>
    );
  }

  renderSubmissionsAction() {
    const { integration } = this.props;

    return (
      <Link to={`/forms/responses/${integration._id}/${integration.formId}`}>
        <Button btnStyle="link">
          <Tip text={__('Submissions')} placement="top">
            <Icon icon="list" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderUnarchiveAction() {
    const { integration, archive } = this.props;

    const onClick = () => archive(integration._id, false);

    if (!archive || integration.isActive) {
      return null;
    }

    return (
      <WithPermission action="integrationsArchive">
        <Tip text={__('Unarchive')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="redo" />
        </Tip>
      </WithPermission>
    );
  }

  renderRemoveAction() {
    const { integration, remove } = this.props;

    const onClick = () => remove(integration._id);

    return (
      <WithPermission action="integrationsRemove">
        <Tip text={__('Delete')} placement="top">
          <Button
            id="integrationDelete"
            btnStyle="link"
            onClick={onClick}
            icon="times-circle"
          />
        </Tip>
      </WithPermission>
    );
  }

  renderCopyAction() {
    const { integration, copy } = this.props;

    const onClick = () => copy(integration._id);

    return (
      <Tip text={__('Duplicate')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="copy-1" />
      </Tip>
    );
  }

  render() {
    const { integration, isChecked, toggleBulk } = this.props;
    const form = integration.form || ({} as any);
    const lead = integration.leadData || {};

    const createdUser = form.createdUser || {
      _id: '',
      details: { fullName: '' }
    };
    const tags = integration.tags;

    const percentage: string | number = lead.conversionRate
      ? lead.conversionRate.toString()
      : '0.00';

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(integration, e.target.checked);
      }
    };

    const labelStyle = integration.isActive ? 'success' : 'warning';
    const status = integration.isActive ? __('Active') : __('Archived');

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
            <Link to={`/forms/edit/${integration._id}/${integration.formId}`}>
              {integration.name}
            </Link>
          </RowTitle>
        </td>
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>
        <td>
          <TextInfo ignoreTrans={true}>{lead.viewCount || 0}</TextInfo>
        </td>
        <td>
          <TextInfo textStyle="primary" ignoreTrans={true}>
            {percentage.substring(0, 4)} %
          </TextInfo>
        </td>
        <td>
          <TextInfo textStyle="danger" ignoreTrans={true}>
            {lead.contactsGathered || 0}
          </TextInfo>
        </td>
        <td>
          <strong>{integration.brand ? integration.brand.name : ''}</strong>
        </td>
        <td>
          <div key={createdUser._id}>
            <Capitalize>
              {createdUser.details && createdUser.details.fullName}
            </Capitalize>
          </div>
        </td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>{dayjs(form.createdDate).format('ll')}</DateWrapper>
        </td>
        {isEnabled('tags') && (
          <td>
            <Tags tags={tags} limit={2} />
          </td>
        )}
        <td>
          <ActionButtons>
            {this.manageAction(integration)}
            {this.renderEditAction(integration)}
            {this.renderArchiveAction()}
            {this.renderUnarchiveAction()}
            {this.renderExportAction()}
            {this.renderSubmissionsAction()}
            {this.renderCopyAction()}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
