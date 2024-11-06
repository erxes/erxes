import React, { Fragment, useState } from 'react';
import { RightDrawerContainer } from '../styles';
import { Dialog, Menu, Transition } from '@headlessui/react'
import Button from '@erxes/ui/src/components/Button';
import Form from '../containers/Form';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  contentType: string;
  content: any;
  serviceName: string;
  as?: 'icon' | 'menuItem';
};

const SaveTemplate = (props: Props) => {

  const { as } = props

  const [toggleDrawer, setToggleDrawer] = useState<boolean>(false);

  const closeDrawer = () => {
    setToggleDrawer(false);
  };

  const handleClick = (e) => {

    e.preventDefault();

    setToggleDrawer(!toggleDrawer);
  };

  const renderForm = () => {
    const finalProps = {
      ...props,
      mode: 'edit',
      closeDrawer
    };

    return <Form {...finalProps} />;
  };

  const renderButton = () => {

    if (as === 'icon') {

      return (

        <Tip text={__("Save as Template")}>
          <Button
            btnStyle="link"
            onClick={handleClick}
            icon="file-plus"
          />
        </Tip>

      )
    }

    if (as === 'menuItem') {

      return (
        <Menu.Item
          as='a'
          onClick={handleClick}
        >
          Save as Template
        </Menu.Item>
      )
    }

    return (
      <Button size="small" icon="file-plus" onClick={handleClick}>
        Save as Template
      </Button>
    )
  }

  return (
    <>
      {renderButton()}

      <Transition.Root show={toggleDrawer} as={Fragment}>
        <Dialog as="div" onClose={() => setToggleDrawer(false)}>

          <Transition.Child as={RightDrawerContainer}>
            <Dialog.Panel as={Fragment}>
              {renderForm()}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default SaveTemplate;