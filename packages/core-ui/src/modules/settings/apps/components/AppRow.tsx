import React from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components';
import copy from 'copy-text-to-clipboard';

import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
// import ModalTrigger from "modules/common/components/ModalTrigger";
import { __, Alert } from 'modules/common/utils';
import { IApp, IAppParams } from '../types';
// import AppForm from './AppForm';

const TokenWrapper = styled.span`
  color: #e83e8c;
  font-size: 87.5%;
  background-color: rgb(230, 230, 255);
  border-radius: 8px;

  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  app: IApp;
  removeApp: (_id: string) => void;
  userGroups: any[];
  closeModal?: () => void;
  addApp?: (doc: IAppParams) => void;
  editApp: (_id: string, doc: IAppParams) => void;
};

export default class AppRow extends React.Component<Props> {
  render() {
    const { app, removeApp } = this.props;

    const onClick = () => {
      removeApp(app._id);
    };

    // const editTrigger = (
    //   <Tip text="Edit" placement="top">
    //     <Button
    //       btnStyle="link"
    //       onClick={() => console.log('asdf')}
    //     >
    //       <Icon icon="edit" />
    //     </Button>
    //   </Tip>
    // );

    // const content = (props) => (
    //   <AppForm
    //     {...props}
    //     extended={true}
    //     userGroups={userGroups}
    //     addApp={addApp}
    //     editApp={editApp}
    //   />
    // );

    const onClickToken = () => {
      copy(app.accessToken);

      Alert.success(__('Token has been copied to clipboard'));
    };

    const dateFormat = 'YYYY-MM-DD HH:mm:ss';

    return (
      <tr>
        <td>{dayjs(app.createdAt).format(dateFormat)}</td>
        <td>{app.name}</td>
        <td>{app.userGroupName}</td>
        <td>
          <Tip text="Click to copy token" placement="right">
            <TokenWrapper onClick={onClickToken}>
              {app.accessToken}
            </TokenWrapper>
          </Tip>
        </td>
        <td>
          {app.expireDate
            ? dayjs(app.expireDate).format(dateFormat)
            : 'No expire date set'}
        </td>
        <td>
          <ActionButtons>
            <Tip text="Delete" placement="top">
              <Button btnStyle="link" onClick={onClick}>
                <Icon icon="times-circle" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}
