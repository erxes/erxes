import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import HelpPopover from '@erxes/ui/src/components/HelpPopover';
import Icon from '@erxes/ui/src/components/Icon';
import { SortItem } from '@erxes/ui/src/styles/sort';
import { __ } from '@erxes/ui/src/utils/core';
import colors from '@erxes/ui/src/styles/colors';

import { ActionButton } from '@erxes/ui/src/components/ActionButtons';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import LinkAction from '../../automations/components/LinkAction';
import { Features } from '../styles';
import { SelectAccount, SelectAccountPages } from '../utils';
import styled from 'styled-components';

const PersistentMenu = styled(SortItem)`
  display: grid;
  grid-template-columns: 80% 10%;
  grid-gap: 15px;
  align-items: center;
`;

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  bot?: any;
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

function Form({ renderButton, closeModal, bot }: Props) {
  const [doc, setDoc] = useState(bot || {});

  const renderPersistentMenus = () => {
    const { persistentMenus = [] } = doc;

    const addPersistentMenu = () => {
      console.log({ persistentMenus });
      setDoc({
        ...doc,
        persistentMenus: [
          ...persistentMenus,
          { _id: Math.random(), title: '' },
        ],
      });
    };

    const onChange = (_id, name, value) => {
      setDoc({
        ...doc,
        persistentMenus: persistentMenus.map((persistentMenu) =>
          persistentMenu._id === _id
            ? { ...persistentMenu, [name]: value }
            : persistentMenu,
        ),
      });
    };

    const handleChange = (_id, e) => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      if (name === 'url') {
        onChange(_id, 'type', 'web_url');
      }

      onChange(_id, name, value);
    };

    const handleRemove = (_id) => {
      setDoc({
        ...doc,
        persistentMenus: persistentMenus.filter(
          (persistentMenu) => persistentMenu._id !== _id,
        ),
      });
    };

    return (
      <FormGroup>
        <ControlLabel>
          {__('Persistence Menu')}
          <HelpPopover title="A Persistence Menu is a quick-access toolbar in your chat. Customize it below for easy navigation to key bot features." />
        </ControlLabel>
        {persistentMenus.map(({ _id, title, url }) => (
          <PersistentMenu key={_id} isDragging={false} isModal={false}>
            <FormControl
              placeholder="type a title"
              name="title"
              value={title}
              onChange={(e) => handleChange(_id, e)}
            />
            <ActionButton>
              <LinkAction
                container={this}
                name="url"
                link={url}
                onChange={(e) => handleChange(_id, e)}
              />
              <Icon
                icon="cancel-1"
                color={colors.colorCoreRed}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRemove(_id)}
              />
            </ActionButton>
          </PersistentMenu>
        ))}
        <LinkButton onClick={addPersistentMenu}>
          {__('Add Persistent Menu')}
        </LinkButton>
      </FormGroup>
    );
  };

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
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl {...formProps} name="name" required value={doc?.name} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Accounts')}</ControlLabel>
          <SelectAccount
            initialValue={doc?.accountId}
            name="accountId"
            label="select a account"
            onSelect={onSelect}
          />
        </FormGroup>
        <Features isToggled={doc?.accountId}>
          <FormGroup>
            <ControlLabel>{__('Pages')}</ControlLabel>
            <SelectAccountPages
              accountId={doc?.accountId}
              initialValue={doc?.pageId}
              onSelect={onSelect}
            />
          </FormGroup>
          {renderPersistentMenus()}
        </Features>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'Bot',
            values: generateDoc(values),
            isSubmitted,
            object: bot,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}

export default Form;
