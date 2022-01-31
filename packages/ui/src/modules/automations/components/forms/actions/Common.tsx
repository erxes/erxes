import React from 'react';
import { ScrolledContent } from 'modules/automations/styles';
import { __ } from 'modules/common/utils';
import { IAction } from 'modules/automations/types';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import { ActionFooter } from './styles';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  config: any;
  children: React.ReactNode;
};

function Common(props: Props) {
  const { addAction, activeAction, closeModal, config, children } = props;

  const onSave = () => {
    addAction(activeAction, activeAction.id, config);

    closeModal();
  };

  return (
    <ScrolledContent>
      {children}

      <ActionFooter>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={onSave}>
            Save
          </Button>
        </ModalFooter>
      </ActionFooter>
    </ScrolledContent>
  );
}

export default Common;
