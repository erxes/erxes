import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import Form from '../containers/Form';

import { IGolomtBankConfigsItem } from '../../types/IConfigs';

type Props = {
  config: IGolomtBankConfigsItem;
  remove: (id: string) => void;
};

const Row = (props: Props) => {
  const { config, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(config._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="configDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const formContent = props => <Form {...props} config={config} />;

  return (
    <tr>
      <td key={config._id}>
        <RowTitle>{config.accountId || '-'}</RowTitle>
      </td>
      <td>
        <ActionButtons>
          <ModalTrigger
            title={__('Corporate Gateway')}
            trigger={<Button btnStyle="link" icon="edit-3" />}
            content={formContent}
            size={'sm'}
          />
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
