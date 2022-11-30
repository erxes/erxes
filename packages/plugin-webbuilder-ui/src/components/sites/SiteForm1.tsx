import React, { useState } from 'react';

import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ISiteDoc } from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  site?: ISiteDoc;
  closeModal: () => void;
  save: (values: any, id: string) => void;
};

function Form(props: Props) {
  const { closeModal, site = {} as ISiteDoc, save } = props;

  const [name, setName] = useState(site.name || '');
  const [domain, setDomain] = useState(site.domain || '');

  const onChangeName = (value: string) => {
    setName(value);
  };

  const onChangeDomain = (value: string) => {
    setDomain(value);
  };

  const handleSubmit = () => {
    if (!name) {
      return Alert.error('Please enter a name!');
    }

    save(
      {
        name,
        domain
      },
      site._id
    );
  };

  const renderContent = () => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Name:</ControlLabel>
          <FormControl
            placeholder="Enter a name"
            onChange={(e: any) => onChangeName(e.target.value)}
            defaultValue={name}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Domain:</ControlLabel>
          <FormControl
            placeholder="Enter a domain"
            onChange={(e: any) => onChangeDomain(e.target.value)}
            defaultValue={domain}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          <Button
            btnStyle="success"
            type="submit"
            icon="check-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} onSubmit={handleSubmit} />;
}

export default Form;
