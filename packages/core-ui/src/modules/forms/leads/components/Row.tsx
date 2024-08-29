import dayjs from 'dayjs';
import React from 'react';
import { Link } from 'react-router-dom';


import { RowTitle } from '@erxes/ui-engage/src/styles';
import { Capitalize } from '@erxes/ui-settings/src/permissions/styles';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { isEnabled } from '@erxes/ui/src/utils/core';

import WithPermission from '../../../common/components/WithPermission';
import { __, getEnv } from '../../../common/utils';
import Manage from './Manage';
import { ActionButtons, Button, FormControl, Icon, Label, ModalTrigger, Tags, TextInfo, Tip } from '@erxes/ui/src/components';

const Row = ({
  integration,
  isChecked,
  toggleBulk,
  remove,
  archive,
  copy,
  showCode,
}) => {
  const manageAction = (integration) => {
    const { formId } = integration;

    return (
      <Link to={`/forms/edit/${integration._id}/${formId}`}>
        <Button btnStyle='link'>
          <Tip text={__('Manage')} placement='top'>
            <Icon icon='edit-3' />
          </Tip>
        </Button>
      </Link>
    );
  };

  const renderEditAction = (integration) => {
    const trigger = (
      <Button btnStyle='link'>
        <Tip text={__('Install code')} placement='top'>
          <Icon icon='code' />
        </Tip>
      </Button>
    );

    const content = (props) => <Manage integration={integration} {...props} />;

    return (
      <ModalTrigger
        title={`Install code of ${integration.name}`}
        size='lg'
        trigger={trigger}
        content={content}
        isOpen={showCode}
        isAnimate={true}
      />
    );
  };

  const renderArchiveAction = () => {
    const onClick = () => archive(integration._id, true);

    if (!archive || !integration.isActive) {
      return null;
    }

    return (
      <WithPermission action='integrationsArchive'>
        <Tip text={__('Archive')} placement='top'>
          <Button btnStyle='link' onClick={onClick} icon='archive-alt' />
        </Tip>
      </WithPermission>
    );
  };

  const renderExportAction = () => {
    const { REACT_APP_API_URL } = getEnv();

    const onClick = () => {
      window.open(
        `${REACT_APP_API_URL}/pl:contacts/file-export?type=customer&popupData=true&form=${integration.formId}`,
        '_blank'
      );
    };

    return (
      <Tip text={__('Download responses')} placement='top'>
        <Button btnStyle='link' onClick={onClick} icon='down-arrow' />
      </Tip>
    );
  };

  const renderSubmissionsAction = () => (
    <Link to={`/forms/responses/${integration._id}/${integration.formId}`}>
      <Button btnStyle='link'>
        <Tip text={__('Submissions')} placement='top'>
          <Icon icon='list' />
        </Tip>
      </Button>
    </Link>
  );

  const renderUnarchiveAction = () => {
    const onClick = () => archive(integration._id, false);

    if (!archive || integration.isActive) {
      return null;
    }

    return (
      <WithPermission action='integrationsArchive'>
        <Tip text={__('Unarchive')} placement='top'>
          <Button btnStyle='link' onClick={onClick} icon='redo' />
        </Tip>
      </WithPermission>
    );
  };

  const renderRemoveAction = () => {
    const onClick = () => remove(integration._id);

    return (
      <WithPermission action='integrationsRemove'>
        <Tip text={__('Delete')} placement='top'>
          <Button
            id='integrationDelete'
            btnStyle='link'
            onClick={onClick}
            icon='times-circle'
          />
        </Tip>
      </WithPermission>
    );
  };

  const renderCopyAction = () => {
    const onClick = () => copy(integration._id);

    return (
      <Tip text={__('Duplicate')} placement='top'>
        <Button btnStyle='link' onClick={onClick} icon='copy-1' />
      </Tip>
    );
  };

  const form = integration.form || {};
  const lead = integration.leadData || {};

  const createdUser = form.createdUser || {
    _id: '',
    details: { fullName: '' },
  };
  const tags = integration.tags;

  const percentage = lead.conversionRate
    ? lead.conversionRate.toString()
    : '0.00';

  const onChange = (e) => {
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
          componentclass='checkbox'
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
        <TextInfo $textStyle='primary' ignoreTrans={true}>
          {percentage.substring(0, 4)} %
        </TextInfo>
      </td>
      <td>
        <TextInfo $textStyle='danger' ignoreTrans={true}>
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
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(form.createdDate).format('ll')}</DateWrapper>
      </td>
      {isEnabled('tags') && (
        <td>
          <Tags tags={tags} limit={2} />
        </td>
      )}
      <td>
        <Label lblStyle='simple'>{integration.leadData.loadType}</Label>
      </td>
      <td>
        <ActionButtons>
          {manageAction(integration)}
          {renderEditAction(integration)}
          {renderArchiveAction()}
          {renderUnarchiveAction()}
          {renderExportAction()}
          {renderSubmissionsAction()}
          {renderCopyAction()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
