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

  const renderOptions = (array) => {
    return array.map((obj) => ({
      value: obj.extension,
      label: obj.fullname || obj.extension,
    }));
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>Transfer call</ControlLabel>

        <Select
          placeholder={__('Choose a extension')}
          value={renderOptions(datas).find(
            (o) => o.value === selectedExtension,
          )}
          options={renderOptions(datas)}
          onChange={onChange}
          isClearable={false}
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
