import Button from '@erxes/ui/src/components/Button';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { readFile, __ } from '@erxes/ui/src/utils';
import { Link } from 'react-router-dom';
import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import { Indicator } from '@erxes/ui/src/components/step/styles';
import { ControlWrapper } from '@erxes/ui/src/components/step/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Step from '@erxes/ui/src/components/step/Step';
import Steps from '@erxes/ui/src/components/step/Steps';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import React, { useState, useEffect } from 'react';
import { IContentTypeDoc, IEntryDoc } from '../../types';
import { Uploader } from '@erxes/ui/src/components';

type Props = {
  contentType: IContentTypeDoc;
  entry?: IEntryDoc;
  save: (contentTypeId: string, values: any) => void;
};

function Form(props: Props) {
  const { contentType, entry = {} as IEntryDoc, save } = props;
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

  const renderContent = () => {
    return (
      <Step title="Manage Entry" noButton={true}>
        <FlexItem>
          <FlexPad direction="column" overflow="auto">
            <FormWrapper>
              <FormColumn>
                {fields.map(field => {
                  return renderField(field);
                })}
              </FormColumn>
            </FormWrapper>
          </FlexPad>

          <FlexItem overflow="auto" />
        </FlexItem>
      </Step>
    );
  };

  const renderButtons = () => {
    const cancelButton = (
      <Link to={`/webbuilder/entries/?contentTypeId=${contentType._id}`}>
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          btnStyle="success"
          icon={'check-circle'}
          onClick={() => submit()}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  const breadcrumb = [
    {
      title: 'Webbuilder',
      link: `/webbuilder/entries/?contentTypeId=${contentType._id}`
    },
    { title: 'Entries' }
  ];

  return (
    <>
      <StepWrapper>
        <Wrapper.Header title={'Entry Form'} breadcrumb={breadcrumb} />
        <Steps>{renderContent()}</Steps>

        <ControlWrapper>
          <Indicator>
            {__('You are')} {entry ? 'editing' : 'creating'}
            <strong>{' entry'}</strong>
          </Indicator>
          {renderButtons()}
        </ControlWrapper>
      </StepWrapper>
    </>
  );
}

export default Form;
