import { Alert } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

type Props = {
  closeModal: () => void;
  handleSubmit: (title: string, file: File) => void;
};

const SalaryForm = (props: Props) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);

  const onChangeFile = (e: any) => {
    const f = e.currentTarget.files[0];
    if (f.type !== 'text/csv') {
      return Alert.error('Please choose a csv file');
    }

    setFile(f);
  };

  const onSubmit = (e: any) => {
    e.preventDefault();

    if (!title) {
      return Alert.error('Please enter a title');
    }

    if (!file) {
      return Alert.error('Please choose a file');
    }

    if (file.type !== 'text/csv') {
      return Alert.error('Please choose a csv file');
    }

    props.handleSubmit(title, file);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            value={title}
            onChange={(e: any) => setTitle(e.currentTarget.value)}
          />

          <ControlLabel>File</ControlLabel>
          <label htmlFor="file-upload">
            <input id="file-upload" type="file" onChange={onChangeFile} />
          </label>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          <Button
            btnStyle="success"
            type="submit"
            icon="check-circle"
            uppercase={false}
            disabled={isSubmitted}
            onClick={onSubmit}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default SalaryForm;
