import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

function Header() {
  return (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title="System config"
      description={
        __(
          'Set up your initial account settings so that things run smoothly in unison'
        ) + '.'
      }
    />
  );
}

export default Header;
