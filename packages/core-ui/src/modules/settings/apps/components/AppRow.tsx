import React from 'react';
import dayjs from 'dayjs';

import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { IApp } from '../types';

type Props = {
  app: IApp;
}

export default class AppRow extends React.Component<Props> {
  render() {
    const { app } = this.props;
  
    return (
      <tr>
        <td>{dayjs(app.createdAt).format('YYYY-MM-DD HH:mm:ss')}</td>
        <td>{app.name}</td>
        <td>{app.userGroupName}</td>
        <td>
            <ActionButtons>
              <Tip text="Delete" placement="top">
                <Button
                  btnStyle="link"
                >
                  <Icon icon="times-circle" />
                </Button>
              </Tip>
            </ActionButtons>
          </td>
      </tr>
    );
  }
}
