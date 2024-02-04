import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import ReportFormModal from '../report/ReportFormModal';

type Props = {
  serviceName: string;
  history: any;
  queryParams: any;
};

const CommonForm = (props: Props) => {
  const triggerBtn = <Button btnStyle="primary">Create a report</Button>;
  const [showModal, setShowModal] = useState(false);

  return (
    <ModalTrigger
      title={__('Create a report')}
      trigger={triggerBtn}
      isOpen={showModal}
      content={() => <ReportFormModal {...props} setShowModal={setShowModal} />}
      onExit={() => setShowModal(false)}
    />
  );
};

export default CommonForm;
