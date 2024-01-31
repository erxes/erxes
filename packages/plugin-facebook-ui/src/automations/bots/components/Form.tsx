import Button from '@erxes/ui/src/components/Button';
import HelpPopover from '@erxes/ui/src/components/HelpPopover';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';

import {
  Content,
  MessengerPreview,
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import { BreadCrumb, PageHeader, Step, Steps } from '@erxes/ui/src';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { Preview, StepWrapper } from '@erxes/ui/src/components/step/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import ButtonsGenerator from '../../components/action/ButtonGenerator';
import { Padding } from '../../styles';
import { Features } from '../styles';
import { SelectAccount, SelectAccountPages } from '../utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  bot?: any;
  returnToList: () => void;
};

function removeNullAndTypename(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeNullAndTypename);
  }

  const cleanedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== null && key !== '__typename') {
      cleanedObj[key] = removeNullAndTypename(obj[key]);
    }
  }

  return cleanedObj;
}

function Form({ renderButton, bot, returnToList }: Props) {
  const [doc, setDoc] = useState(bot || {});

  const generateDoc = (values) => {
    return { ...removeNullAndTypename(doc || {}), ...values };
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    const onSelect = (value, name) => {
      setDoc({ ...doc, [name]: value });
    };

    return (
      <>
        <Steps>
          <Step title="Select Account" img="/images/icons/erxes-01.svg">
            <Padding>
              <SelectAccount
                initialValue={doc?.accountId}
                name="accountId"
                onSelect={onSelect}
              />
            </Padding>
          </Step>
          <Step title="Select Your Page" img="/images/icons/erxes-04.svg">
            <Padding>
              <Features isToggled={doc?.accountId}>
                <FormGroup>
                  <ControlLabel>{__('Pages')}</ControlLabel>
                  <SelectAccountPages
                    accountId={doc?.accountId}
                    initialValue={doc?.pageId}
                    onSelect={onSelect}
                  />
                </FormGroup>
              </Features>
            </Padding>
          </Step>
          <Step title="Bot Setup" img="/images/icons/erxes-24.svg" noButton>
            <Padding>
              <FormGroup>
                <ControlLabel>{__('Name')}</ControlLabel>
                <p>{__('Name this bot to differentiate from the rest')}</p>
                <FormControl
                  {...formProps}
                  name="name"
                  required
                  defaultValue={doc?.name}
                />
              </FormGroup>
              <ControlLabel>
                {__('Persistence Menu')}
                <HelpPopover title="A Persistence Menu is a quick-access toolbar in your chat. Customize it below for easy navigation to key bot features." />
              </ControlLabel>
              <ButtonsGenerator
                _id=""
                buttons={doc.persistentMenus || []}
                addButtonLabel="Add Persistence Menu"
                onChange={(_id, _name, values) =>
                  setDoc({ ...doc, persistentMenus: values })
                }
              />
            </Padding>
          </Step>
        </Steps>
        <ModalFooter>
          <Padding>
            <Button btnStyle="simple" onClick={returnToList}>
              {__('Cancel')}
            </Button>
            {renderButton({
              name: 'Bot',
              values: generateDoc(values),
              isSubmitted,
              object: bot,
            })}
          </Padding>
        </ModalFooter>
        {/* 


        */}
      </>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    {
      title: __('Bots config'),
      link: '/settings/automations/bots',
    },
    { title: __(bot ? `Edit ${bot.name}` : 'Create Bot') },
  ];

  return (
    <>
      <PageHeader>
        <BreadCrumb breadcrumbs={breadcrumb} />
      </PageHeader>
      <StepWrapper>
        <Content>
          <CommonForm renderContent={renderContent} />
          <MessengerPreview>
            <Preview fullHeight>Hello world</Preview>
          </MessengerPreview>
        </Content>
      </StepWrapper>
    </>
  );
}

export default Form;
