import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { Alert, __ } from '@erxes/ui/src/utils';

import { IJob } from '../../../types';
import { ScrolledContent } from '../../../styles';
import { FlowJobFooter } from './styles';

type Props = {
  closeModal: () => void;
  activeFlowJob?: IJob;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  description: string;
  config: any;
  children: React.ReactNode;
};

function Common(props: Props) {
  const {
    addFlowJob,
    activeFlowJob,
    closeModal,
    children,
    description,
    config
  } = props;

  const onSave = () => {
    if (!activeFlowJob) {
      return Alert.error('has not active FlowJob');
    }

    addFlowJob({ ...activeFlowJob, description }, activeFlowJob.id, config);

    closeModal();
  };

  return (
    <ScrolledContent>
      {children}

      <FlowJobFooter>
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
      </FlowJobFooter>
    </ScrolledContent>
  );
}

export default Common;
