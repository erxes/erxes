import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import ReportFormModal from '../report/ReportFormModal';
import { MarginX } from '../../styles';

type Props = {
  serviceName: string;
  history: any;
  queryParams: any;
};

const CommonForm = (props: Props) => {
  const { serviceName } = props;
  const triggerBtn = (
    <Button btnStyle="primary">Create {serviceName || 'a'} report</Button>
  );
  const [showModal, setShowModal] = useState(false);

  return (
    <MarginX margin={20}>
      <ModalTrigger
        title={__(`Create ${serviceName || 'a'} report`)}
        trigger={triggerBtn}
        isOpen={showModal}
        content={() => (
          <ReportFormModal {...props} setShowModal={setShowModal} />
        )}
        onExit={() => setShowModal(false)}
      />
    </MarginX>
  );
};

export default CommonForm;
