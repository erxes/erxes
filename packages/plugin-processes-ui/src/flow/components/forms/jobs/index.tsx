import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { IJob } from '../../../types';
import JobForm from '../../../containers/forms/jobs/subForms/JobForm';
import EndPointForm from '../../../containers/forms/jobs/subForms/EndPointForm';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeFlowJob: IJob;
  addAction: (action: IJob, actionId?: string, config?: any) => void;
};

class DefaultForm extends React.Component<Props> {
  render() {
    const { activeFlowJob, onSave, closeModal } = this.props;

    return (
      <>
        <div>
          {__('contents')} {activeFlowJob.type}
        </div>
        <ModalFooter>
          <Button
            btnStyle="simple"
            size="small"
            icon="times-circle"
            onClick={closeModal}
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={onSave}>
            Saves
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export const ActionForms = {
  default: DefaultForm,
  job: JobForm,
  endPoint: EndPointForm
};
