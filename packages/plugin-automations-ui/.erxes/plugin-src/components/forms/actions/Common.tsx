import React from 'react';
import { ScrolledContent } from '../../../styles';
import { __ } from 'coreui/utils';
import { IAction } from '../../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
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
