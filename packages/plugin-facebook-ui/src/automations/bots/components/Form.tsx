import {
  Content,
  MessengerPreview,
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import Steps from '@erxes/ui/src/components//step/Steps';
import Button from '@erxes/ui/src/components/Button';
import HelpPopover from '@erxes/ui/src/components/HelpPopover';
import BreadCrumb from '@erxes/ui/src/components/breadcrumb/BreadCrumb';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Step from '@erxes/ui/src/components/step/Step';
import { Preview, StepWrapper } from '@erxes/ui/src/components/step/styles';
import { PageHeader } from '@erxes/ui/src/layout/styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import Accounts from '../../../containers/Accounts';
import ButtonsGenerator from '../../components/action/ButtonGenerator';
import { Padding } from '../../styles';
import { EmulatorWrapper, Features, MobileEmulator } from '../styles';
import { SelectAccountPages, fetchPageDetail } from '../utils';
import { Avatar } from '@erxes/ui-cards/src/boards/styles/item';
import Icon from '@erxes/ui/src/components/Icon';

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
  const [selectedAccount, setAccount] = useState(null as any);
  const [isLastStep, setLastStep] = useState(false);

  useEffect(() => {
    if (!bot && selectedAccount) {
      fetchPageDetail(selectedAccount, doc.pageId).then((response) => {
        setDoc({
          ...doc,
          profileUrl: response?.profileUrl,
          page: { ...doc.page, name: response?.name },
        });
      });
    }
  }, [doc.pageId]);

  const generateDoc = (values) => {
    return { ...removeNullAndTypename(doc || {}), ...values };
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    const onSelect = (value, name) => {
      console.log({ name, value });
      setDoc({ ...doc, [name]: value });
    };

    return (
      <>
        <Steps>
          <Step
            title="Select Account"
            img="/images/icons/erxes-01.svg"
            onClick={() => setLastStep(false)}
          >
            <Padding>
              <Accounts
                kind="facebook"
                selectedAccountId={doc?.accountId}
                onRemove={() => null}
                onSelect={(accountId, account) => {
                  console.log(account);
                  onSelect(accountId, 'accountId'), setAccount(account);
                }}
              />
            </Padding>
          </Step>
          <Step
            title="Select Your Page"
            img="/images/icons/erxes-04.svg"
            onClick={() => setLastStep(false)}
          >
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
          <Step
            title="Bot Setup"
            img="/images/icons/erxes-24.svg"
            noButton
            onClick={() => setLastStep(true)}
          >
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
                {__('Persistent Menu')}
                <HelpPopover title="A Persistent Menu is a quick-access toolbar in your chat. Customize it below for easy navigation to key bot features." />
              </ControlLabel>
              <ButtonsGenerator
                _id=""
                buttons={doc.persistentMenus || []}
                addButtonLabel="Add Persistent Menu"
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
            <Preview fullHeight>
              <EmulatorWrapper>
                <MobileEmulator disabled={!doc?.pageId} isLastStep={isLastStep}>
                  <div className="top-bar">
                    <div className="dynamic-island" />
                  </div>
                  <div className="profile">
                    <Avatar
                      src={
                        doc?.profileUrl
                          ? doc.profileUrl
                          : '/images/erxes-bot.svg'
                      }
                    />
                    <p>{doc?.page ? doc?.page?.name : 'Profile Name'}</p>
                  </div>
                  {!isLastStep ? (
                    <>
                      <div className="getStarted">
                        <span>tap to send</span>
                        <button>Get Started</button>
                      </div>
                      <span>
                        {`You started a chat with ${
                          doc?.page ? doc?.page?.name : '{ Profile Name }'
                        }. We use information from
                    this chat to improve your experience.`}
                        <br />
                        <a
                          href={`https://www.facebook.com/profile.php?id=${doc?.pageId}#`}
                          target="_blank"
                        >
                          Learn about business chats and your privacy.
                        </a>
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="content">
                        <div className="inputField">
                          <input type="text" />
                          <button>
                            <Icon icon="send" />
                          </button>
                        </div>
                        <div className="message-row">
                          <Avatar
                            src={
                              doc?.profileUrl
                                ? doc.profileUrl
                                : '/images/erxes-bot.svg'
                            }
                          />
                          <span>{'Get Started'}</span>
                        </div>
                      </div>
                      <div className="persistentMenu">
                        <div className="dragger" />
                        <ul>
                          {(doc?.persistentMenus || []).map((menu) => (
                            <li>{menu.text || ''}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </MobileEmulator>
              </EmulatorWrapper>
            </Preview>
          </MessengerPreview>
        </Content>
      </StepWrapper>
    </>
  );
}

export default Form;
