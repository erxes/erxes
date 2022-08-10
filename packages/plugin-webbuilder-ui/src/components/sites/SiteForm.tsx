import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { ISiteDoc } from '../../types';
import Alert from '@erxes/ui/src/utils/Alert';

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
