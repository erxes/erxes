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
  WithPermission
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

class Row extends React.Component<Props> {
  manageAction(pos) {
    return (
      <Link to={`/pos/edit/${pos._id}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderRemoveAction() {
    const { pos, remove } = this.props;

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
  }

  renderCopyAction = object => {
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

  render() {
    const { pos } = this.props;
    const isOnline = pos.isOnline ? 'online pos' : 'offline pos';

    const createdUser = pos.user || {
      _id: '',
      details: { fullName: '' }
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
            {this.manageAction(pos)}
            {this.renderCopyAction(pos)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
