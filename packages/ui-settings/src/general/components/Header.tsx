import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

function Header({
  title,
  description
}: {
  title?: string;
  description?: string;
}) {
  return (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title={title || ''}
      description={description || ''}
    />
  );
}

export default Header;
