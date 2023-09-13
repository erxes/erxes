import React from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
// erxes
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Label from '@erxes/ui/src/components/Label';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import { DateWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  data: any;
  remove: () => void;
  handleStatus: (status: string) => void;
};

export default function Row(props: Props) {
  const { data = {}, remove, handleStatus } = props;

  // Functions
  const generateStatusStyle = () => {
    switch (data.status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'archived':
        return 'warning';
      default:
        return 'simple';
    }
  };

  const renderArchiveButton = () => {
    if (data.status === 'archived')
      return (
        <Tip text={__('Unarchive')} placement="bottom">
          <Button
            type="button"
            btnStyle="link"
            onClick={() => handleStatus('active')}
            size="small"
          >
            <Icon icon="redo" />
          </Button>
        </Tip>
      );
    else
      return (
        <Tip text={__('Archive')} placement="bottom">
          <Button
            type="button"
            btnStyle="link"
            onClick={() => handleStatus('archived')}
            size="small"
          >
            <Icon icon="archive-alt" />
          </Button>
        </Tip>
      );
  };

  const renderCompleteButton = () => {
    if (
      data.status !== 'archived' &&
      data.status !== 'disabled' &&
      data.status !== 'completed'
    )
      return (
        <Tip text={__('Mark as Complete')} placement="bottom">
          <Button
            type="button"
            btnStyle="link"
            onClick={() => handleStatus('completed')}
            size="small"
          >
            <Icon icon="check-circle" />
          </Button>
        </Tip>
      );

    return;
  };

  const renderActions = () => {
    return (
      <td>
        <ActionButtons>
          {renderArchiveButton()}
          {renderCompleteButton()}
          <Tip text={__('Edit')} placement="bottom">
            <Link to={`/pricing/plans/edit/${data._id && data._id}`}>
              <Button type="button" btnStyle="link" size="small">
                <Icon icon="edit-3" />
              </Button>
            </Link>
          </Tip>
          <Tip text={__('Delete')} placement="bottom">
            <Button type="button" btnStyle="link" onClick={remove} size="small">
              <Icon icon="times-circle" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    );
  };

  return (
    <tr>
      <td>{data.name && data.name}</td>
      <td>
        <Label lblStyle={generateStatusStyle()} ignoreTrans={true}>
          {data.status && data.status}
        </Label>
      </td>
      <td>
        <b>{data.createdUser && data.createdUser.details?.fullName}</b>
      </td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>
          {data.createdAt && dayjs(data.createdAt).format('ll')}
        </DateWrapper>
      </td>
      <td>
        <Icon icon="calender" />{' '}
        <DateWrapper>
          {data.updatedAt && dayjs(data.updatedAt).format('ll')}
        </DateWrapper>
      </td>
      {renderActions()}
    </tr>
  );
}
