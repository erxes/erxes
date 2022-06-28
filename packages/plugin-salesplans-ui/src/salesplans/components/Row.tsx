import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  __,
  ActionButtons,
  Button,
  Tip,
  TextInfo,
  Icon,
  ModalTrigger,
  Label
} from '@erxes/ui/src';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import FormContainer from '../containers/Form';

type Props = {
  data: any;
  editData: (_id: string, data: any) => void;
  removeData: (_id: string) => void;
  statusUpdate: (_id: string, status: string) => void;
};

const Row = (props: Props) => {
  const { data = {}, editData, removeData, statusUpdate } = props;

  const renderStatus = () => {
    switch (data && data.status) {
      case 'active':
        return <Label lblStyle="success">{__('Active')}</Label>;
      case 'disabled':
        return <Label lblStyle="danger">{__('Disabled')}</Label>;
      case 'archived':
        return <Label lblStyle="warning">{__('Archived')}</Label>;
      case 'pending':
        return <Label lblStyle="warning">{__('Pending')}</Label>;
      case 'published':
        return <Label lblStyle="default">{__('Published')}</Label>;
      default:
        return '';
    }
  };

  const renderPublish = () => {
    if (data && ['pending', 'published'].includes(data.status)) return null;

    return (
      <Tip text={__('Publish')} placement="bottom">
        <Button
          id="publish-box-line"
          btnStyle="link"
          onClick={() => statusUpdate(data && data._id, 'pending')}
        >
          <Icon icon="check-circle" />
        </Button>
      </Tip>
    );
  };

  const renderArchive = () => {
    if (data && ['pending', 'published'].includes(data.status)) return null;

    if (data && data.status === 'archived')
      return (
        <Tip text={__('Unarchive')} placement="bottom">
          <Button
            id="unarchive-box-line"
            btnStyle="link"
            onClick={() => statusUpdate(data._id, 'active')}
          >
            <Icon icon="redo" />
          </Button>
        </Tip>
      );

    return (
      <Tip text={__('Archive')} placement="bottom">
        <Button
          id="archive-box-line"
          btnStyle="link"
          onClick={() => statusUpdate(data._id, 'archived')}
        >
          <Icon icon="archive-alt" />
        </Button>
      </Tip>
    );
  };

  const renderManage = () => {
    if (data && ['pending', 'published'].includes(data.status)) return null;

    const renderTrigger = () => (
      <Button btnStyle="link">
        <Tip text={__('Manage')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const renderContent = (formProps: any) => {
      return (
        <FormContainer
          {...formProps}
          initialData={data && data}
          submit={submission => editData(data && data._id, submission)}
        />
      );
    };

    return (
      <ModalTrigger
        size="lg"
        title={__('Edit')}
        autoOpenKey="showSLEditSalesLogModal"
        trigger={renderTrigger()}
        content={formProps => renderContent(formProps)}
        enforceFocus={false}
      />
    );
  };

  const renderRemove = () => {
    if (data && ['pending', 'published'].includes(data.status)) return null;

    return (
      <Tip text={__('Remove')} placement="bottom">
        <Button
          id="remove-box-line"
          btnStyle="link"
          onClick={() => removeData(data && data._id)}
        >
          <Icon icon="times-circle" />
        </Button>
      </Tip>
    );
  };

  return (
    <tbody>
      <tr>
        <td>{(data && data.name) || ''}</td>
        <td>
          <TextInfo>
            {((data && data.branchDetail) || {}).title || 'Branch'}
          </TextInfo>
        </td>
        <td>
          <TextInfo>
            {((data && data.departmentDetail) || {}).title || 'Department'}
          </TextInfo>
        </td>
        <td>{(data && data.type) || 'Type'}</td>
        <td>{renderStatus()}</td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>
            {dayjs(data.createdAt).format('ll') || 'Created at'}
          </DateWrapper>
        </td>
        <td>{data && data.createdUser ? data.createdUser.username : ''}</td>
        <td>
          <ActionButtons>
            {renderPublish()}
            {renderArchive()}
            <Tip text={__('Products')} placement="bottom">
              <Link to={`/sales-plans/products?salesLogId=${data && data._id}`}>
                <Button id="product-box-line" btnStyle="link">
                  <Icon icon="box" />
                </Button>
              </Link>
            </Tip>
            {renderManage()}
            <Tip text={__('Duplicate')} placement="bottom">
              <Button id="duplicate-box-line" btnStyle="link">
                <Icon icon="copy-1" />
              </Button>
            </Tip>
            {renderRemove()}
          </ActionButtons>
        </td>
      </tr>
    </tbody>
  );
};

export default Row;
