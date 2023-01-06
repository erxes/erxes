import React from 'react';
import { Link } from 'react-router-dom';
// erxes
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Button from '@erxes/ui/src/components/Button';
import { Title } from '@erxes/ui/src/styles/main';

export default function Actionbar() {
  const renderRight = () => (
    <Link to="/pricing/discounts/create">
      <Button
        type="button"
        btnStyle="success"
        icon="plus-circle"
        uppercase={false}
      >
        {__('Create a Discount')}
      </Button>
    </Link>
  );

  const renderLeft = () => <Title>All discounts</Title>;

  return <Wrapper.ActionBar left={renderLeft()} right={renderRight()} />;
}
