import CopyToClipboard from 'react-copy-to-clipboard';
import dayjs from 'dayjs';
import React from 'react';
import {
  __,
  ActionButtons,
  Alert,
  Button,
  Icon,
  Tip,
  WithPermission,
} from '@erxes/ui/src';
import { Capitalize } from '@erxes/ui-settings/src/permissions/styles';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { IPos } from '../../types';
import { Link } from 'react-router-dom';
import { RowTitle } from '../../styles';

type Props = {
  pos: IPos;
  isChecked: boolean;
  toggleBulk: (pos: IPos, checked: boolean) => void;
  remove: (posId: string) => void;
  showCode?: boolean;
};

const Row = (props: Props) => {
  const { pos, remove } = props;

  const isOnline = pos.isOnline ? 'online' : 'offline pos';
  const onServer = pos.onServer ? 'On server' : 'Without main server';

  const createdUser = pos.user || {
    _id: '',
    details: { fullName: '' },
  };

  const manageAction = (pos) => {
    return (
      <Link to={`/pos/edit/${pos._id}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  };

  const renderRemoveAction = () => {
    const onClick = () => remove(pos._id);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="integrationDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const renderCopyAction = (object) => {
    const onCopy = () => {
      Alert.success('Copied');
    };

    return (
      <CopyToClipboard text={object.token} onCopy={onCopy}>
        <Button btnStyle="link">
          <Tip text={__('Copy token')} placement="top">
            <Icon icon="copy" size={15} />
          </Tip>
        </Button>
      </CopyToClipboard>
    );
  };

  return (
    <tr>
      <td>
        <RowTitle>
          <Link to={`/pos/edit/${pos._id}`}>{pos.name}</Link>
        </RowTitle>
      </td>

      <td>
        <strong>{isOnline}</strong>
      </td>
      <td>
        <strong>{onServer}</strong>
      </td>
      <td>
        <strong>{pos.branchTitle || ''}</strong>
      </td>
      <td>
        <strong>{pos.departmentTitle || ''}</strong>
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
        <DateWrapper>{dayjs(pos.createdAt).format('ll')}</DateWrapper>
      </td>

      <td>
        <ActionButtons>
          {manageAction(pos)}
          {renderCopyAction(pos)}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
