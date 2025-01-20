import { Button, ControlLabel, FormGroup } from '@erxes/ui/src/components';
import React, { useState } from 'react';

import { CloseModal, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import Select from 'react-select';

interface IProps {
  datas: any;
  callTransfer: (extension: string) => void;
  closeModal: any;
}

const renderOptions = (array) => {
  return array.map((obj) => ({
    value: obj.extension,
    label: obj.fullname,
    status: obj.status,
  }));
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'idle':
      return 'green';
    case 'inuse':
      return 'red';
    case 'ringing':
      return 'orange';
    case 'paused':
      return 'gray';
    default:
      return 'black';
  }
};

const formatOptionLabel = ({ label, status }) => (
  <div>
    <span>{label}</span>{' '}
    <span style={{ color: getStatusColor(status) }}>({status})</span>
  </div>
);

const TransferCallForm = (props: IProps) => {
  const { datas = {}, callTransfer } = props;
  const initialExtension = datas?.[0]?.extension ?? null;

  const [selectedExtension, setSelectedExtension] = useState(
    initialExtension || '',
  );

  const onChange = (obj) => {
    setSelectedExtension(obj.value);
  };

  const handleTransferCall = () => {
    selectedExtension && callTransfer(selectedExtension);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>Transfer call</ControlLabel>

        <Select
          placeholder={__('Choose an extension')}
          value={renderOptions(datas).find(
            (o) => o.value === selectedExtension,
          )}
          options={renderOptions(datas)}
          onChange={onChange}
          isClearable={false}
          formatOptionLabel={formatOptionLabel} // Apply custom label formatting
        />
      </FormGroup>

      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="times-circle"
          onClick={() => props.closeModal()}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          btnStyle="success"
          icon="check-circle"
          onClick={handleTransferCall}
        >
          {__('Transfer')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default TransferCallForm;
