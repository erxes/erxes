import React from 'react';

import RowActions from '@erxes/ui-settings/src/common/components/RowActions';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Alert } from '@erxes/ui/src';
import { Button, Icon, Tip } from '@erxes/ui/src/components';
import CopyToClipboard from 'react-copy-to-clipboard';
import { __ } from '@erxes/ui/src/utils';
import { ICommonListProps } from '@erxes/ui-settings/src/common/types';

import { IWebhook } from '../types';

type Props = {
  objects: IWebhook[];
  renderForm: (doc: {
    object: any;
    closeModal: () => void;
    save: () => void;
  }) => React.ReactNode;
  removeWebhook: (id: string) => void;
} & ICommonListProps;

const WebhookRow = (props: Props) => {
  const { objects, renderForm, removeWebhook } = props;

  const onCopy = () => {
    Alert.success('Copied');
  };

  const renderResetPassword = (object) => {
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

  const renderRow = (object: IWebhook) => {
    return (
      <tr key={object._id}>
        <td>{object.url}</td>
        <td>{object.status}</td>

        <RowActions
          {...props}
          object={object}
          size="lg"
          remove={removeWebhook}
          renderForm={renderForm}
          additionalActions={renderResetPassword}
        />
      </tr>
    );
  };

  return <tbody>{objects.map((object) => renderRow(object))}</tbody>;
};

export default WebhookRow;
