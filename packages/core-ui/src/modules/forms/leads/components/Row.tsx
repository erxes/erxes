import dayjs from 'dayjs';
import React from 'react';
import { Link } from 'react-router-dom';

import { RowTitle } from '@erxes/ui-engage/src/styles';
import { Capitalize } from '@erxes/ui-settings/src/permissions/styles';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import WithPermission from '../../../common/components/WithPermission';
import { __, getEnv } from '../../../common/utils';
import Manage from './Manage';
import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  Label,
  ModalTrigger,
  Tags,
  TextInfo,
  Tip,
} from '@erxes/ui/src/components';
import SaveTemplate from '@erxes/ui-template/src/components/SaveTemplate';

const Row = ({
  form,
  isChecked,
  toggleBulk,
  remove,
  archive,
  copy,
  showCode,
}) => {
  
  const renderEditAction = (form) => {
    return (
      <Link to={`/forms/leads/edit/${form._id}`}>
        <Button btnStyle='link'>
          <Tip text={__('Manage')} placement='top'>
            <Icon icon='edit-3' />
          </Tip>
        </Button>
      </Link>
    );
  };

  const renderInstall = (form) => {
    const trigger = (
      <Button btnStyle='link'>
        <Tip text={__('Install code')} placement='top'>
          <Icon icon='code' />
        </Tip>
      </Button>
    );

    const content = (props) => <Manage form={form} {...props} />;

    return (
      <ModalTrigger
        title={`Install code of ${form.name}`}
        size='lg'
        trigger={trigger}
        content={content}
        isOpen={showCode}
        isAnimate={true}
      />
    );
  };

  const renderArchiveAction = () => {
    const onClick = () => archive(form._id, true);
    const tipText = form.status === 'active' ? 'Archive' : 'Activate';
    const icon = form.status === 'active' ? 'archive-alt' : 'redo';
    return (
      <Tip text={__(tipText)} placement='top'>
        <Button btnStyle='link' onClick={onClick} icon={icon} />
      </Tip>
    );
  };

  const renderExportAction = () => {
    const { REACT_APP_API_URL } = getEnv();

    const onClick = () => {
      window.open(
        `${REACT_APP_API_URL}/file-export?type=customer&popupData=true&form=${form._id}`,
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
    <Link to={`/forms/responses/${form._id}`}>
      <Button btnStyle='link'>
        <Tip text={__('Submissions')} placement='top'>
          <Icon icon='list' />
        </Tip>
      </Button>
    </Link>
  );

  const renderUnarchiveAction = () => {
    const onClick = () => archive(form._id, false);

    if (!archive || form.isActive) {
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
    const onClick = () => remove(form._id);

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

  const renderTemplateModal = () => {

    const {
      brandId,
      brand,
      tagIds,
      tags,
      createdUserId,
      createdUser,
      createdDate,
      ...formContent
    } = form;

    const content = {
      content: JSON.stringify(formContent),
      contentType: 'forms',
      serviceName: 'core'
    };

    return <SaveTemplate as="icon" {...content} />;
  }

  const renderCopyAction = () => {
    const onClick = () => copy(form._id);

    return (
      <Tip text={__('Duplicate')} placement='top'>
        <Button btnStyle='link' onClick={onClick} icon='copy-1' />
      </Tip>
    );
  };

  const lead = form.leadData || {};

  const createdUser = form.createdUser || {
    _id: '',
    details: { fullName: '' },
  };
  const tags = form.tags || [];

  const percentage = lead.conversionRate
    ? lead.conversionRate.toString()
    : '0.00';

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(form, e.target.checked);
    }
  };

  const labelStyle = form.status === 'active' ? 'success' : 'warning';
  const status = form.status === 'active' ? __('Active') : __('Archived');

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
          <Link to={`/forms/leads/edit/${form._id}`}>{form.name}</Link>
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
        <strong>{form.brand ? form.brand.name : ''}</strong>
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

      <td>
        <Tags tags={tags || []} limit={2} />
      </td>

      <td>
        <ActionButtons>
          {renderEditAction(form)}
          {renderInstall(form)}
          {renderArchiveAction()}
          {/* {renderUnarchiveAction()} */}
          {renderExportAction()}
          {renderSubmissionsAction()}
          {renderCopyAction()}
          {renderTemplateModal()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
