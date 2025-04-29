import { Alert, __ } from '@erxes/ui/src/utils';
import {
  BackIcon,
  ChooseCountry,
  HeaderItem,
  InputBar,
  KeypadHeader,
  NumberInput,
} from '../styles';

import React, { useEffect, useState } from 'react';

import { FormControl } from '@erxes/ui/src/components/form';
import { ICustomer } from '../types';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  addCustomer: (erxesApiId: string, phoneNumber: string) => void;
  customer: ICustomer;
  phoneNumber: string;
};

const KeyPad = (props: Props) => {
  const [showTrigger, setShowTrigger] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isConnected, setConnected] = useState(
    JSON.parse(localStorage.getItem('config:cloudflareCall') || '{}')
      .isAvailable,
  );

  useEffect(() => {
    let timer;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(() => {})
      .catch((error) => {
        const errorMessage = error
          ?.toString()
          .replace('DOMException:', '')
          .replace('NotFoundError: ', '');
        return Alert.error(errorMessage);
      });

    return () => {
      clearInterval(timer);
    };
  }, []);

  const toggleConnection = () => {
    localStorage.setItem(
      'config:cloudflareCall',
      JSON.stringify({
        isAvailable: !isConnected,
      }),
    );
    setConnected(!isConnected);
  };

  const onBack = () => setShowTrigger(false);
  const search = (e) => {
    const inputValue = e.target.value;
    setSearchValue(inputValue);
  };

  if (showTrigger) {
    return (
      <ChooseCountry>
        <BackIcon onClick={onBack}>
          <Icon icon="angle-left" size={20} /> {__('Back')}
        </BackIcon>
        <InputBar type="country">
          <Icon icon="search-1" size={20} />
          <FormControl
            placeholder={__('Type to search')}
            name="searchValue"
            onChange={search}
            value={searchValue}
            autoFocus={true}
          />
        </InputBar>
      </ChooseCountry>
    );
  }

  const gotoDetail = () => {
    // navigate(`/inbox/index?_id=${currentCallConversationId}`, {
    //   replace: true,
    // });
  };

  return (
    <NumberInput>
      <KeypadHeader>
        <HeaderItem>
          <Icon className={isConnected ? 'on' : 'off'} icon="signal-alt-3" />
          {isConnected ? __('Online') : __('Offline')}
        </HeaderItem>

        <HeaderItem onClick={() => toggleConnection()}>
          <Icon
            className={isConnected ? 'on' : 'off'}
            size={13}
            icon={'power-button'}
          />
          {isConnected ? __('Turn off') : __('Turn on')}
        </HeaderItem>
      </KeypadHeader>
    </NumberInput>
  );
};

export default KeyPad;
