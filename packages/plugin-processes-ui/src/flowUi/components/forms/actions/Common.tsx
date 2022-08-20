import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { Alert, __ } from '@erxes/ui/src/utils';

import { IJob } from '../../../../flow/types';
import { ScrolledContent } from '../../../styles';
import { FlowJobFooter } from './styles';

type Props = {
  closeModal: () => void;
  activeFlowJob?: IJob;
  addFlowJob: (
    data: IJob,
    FlowJobId?: string,
    jobReferId?: string,
    description?: string,
    inBranchId?: string,
    inDepartmentId?: string,
    outBranchId?: string,
    outDepartmentId?: string
  ) => void;
  jobReferId: string;
  description: string;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
  children: React.ReactNode;
};

function Common(props: Props) {
  const {
    addFlowJob,
    activeFlowJob,
    closeModal,
    jobReferId,
    children,
    description,
    inBranchId,
    inDepartmentId,
    outBranchId,
    outDepartmentId
  } = props;

  const onSave = () => {
    if (!activeFlowJob) {
      return Alert.error('has not active FlowJob');
    }

    addFlowJob(
      activeFlowJob,
      activeFlowJob.id,
      jobReferId,
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    );

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
