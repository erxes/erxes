import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
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
