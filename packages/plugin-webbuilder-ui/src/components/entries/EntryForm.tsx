import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IContentTypeDoc, IEntryDoc } from '../../types';
import React, { useEffect, useState } from 'react';
import { __, readFile } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Uploader } from '@erxes/ui/src/components';

type Props = {
  contentType: IContentTypeDoc;
  entry?: IEntryDoc;
  closeModal: () => void;
  save: (contentTypeId: string, values: any) => void;
};

function Form(props: Props) {
  const { contentType, entry = {} as IEntryDoc, save, closeModal } = props;
  const entryValues = entry.values || [];
  const [data, setData] = useState({} as any);

  useEffect(() => {
    entryValues.forEach(val => {
      setData(dat => ({
        ...dat,
        [val.fieldCode]: {
          fieldCode: val.fieldCode,
          value: val.value
        }
      }));
    });
  }, []);

  const { fields = [] } = contentType;

  const submit = () => {
    const values = [] as any;

    fields.map(field => {
      const key = field.code;

      if (data[key]) {
        values.push(data[key]);
      }
    });

    const doc = {
      contentTypeId: contentType._id,
      values
    } as any;

    save(doc.contentTypeId, doc.values);
  };

  const onChange = (fieldCode: string, value: any) => {
    setData(dat => ({
      ...dat,
      [fieldCode]: {
        fieldCode,
        value
      }
    }));
  };

  const renderField = (field: any) => {
    const value = data[field.code]?.value || '';
    let input;

    switch (field.type) {
      case 'textarea':
        input = (
          <EditorCK
            content={value}
            onChange={e => onChange(field.code, e.editor.getData())}
            height={250}
          />
        );

        break;
      case 'input':
        input = (
          <FormControl
            value={value}
            onChange={(e: any) => onChange(field.code, e.target.value)}
          />
        );
        break;

      case 'file':
        input = (
          <Uploader
            defaultFileList={
              value
                ? [
                    {
                      name: field.code,
                      url: value,
                      type: 'image'
                    }
                  ]
                : []
            }
            onChange={(e: any) => onChange(field.code, readFile(e[0]?.url))}
            single={true}
          />
        );

        break;
    }

    return (
      <FormGroup key={field.code}>
        <ControlLabel htmlFor="html">{field.text}:</ControlLabel>
        {input}
      </FormGroup>
    );
  };

  const renderButtons = () => {
    const cancelButton = (
      <Button
        btnStyle="simple"
        icon="times-circle"
        onClick={closeModal}
        uppercase={false}
      >
        Cancel
      </Button>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          btnStyle="success"
          icon={'check-circle'}
          uppercase={false}
          onClick={() => submit()}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  return (
    <>
      <FormWrapper>
        <FormColumn>
          {fields.map(field => {
            return renderField(field);
          })}
        </FormColumn>
      </FormWrapper>
      <ModalFooter> {renderButtons()}</ModalFooter>
    </>
  );
}

export default Form;
