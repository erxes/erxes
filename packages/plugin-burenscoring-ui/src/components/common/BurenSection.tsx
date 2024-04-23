import Box from '@erxes/ui/src/components/Box';
import React from 'react';
import { __ } from '@erxes/ui/src';
import {  withProps } from '@erxes/ui/src/utils/core';
import Button from '@erxes/ui/src/components/Button';

import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { Link } from 'react-router-dom';
import { ButtonRelated } from '@erxes/ui/src/styles/main';
import ScoringForm from '../../containers/ScoringForm';

type Props = {
  collapseCallback?: () => void;
  title?: string;
  
  mainType?: string;
  mainTypeId?: string;
};
function Component(
  this: any,
  {
    collapseCallback,
    title,
    mainType = '',
    mainTypeId = '',
  }: Props
) {
  
  const trigger = (
    <ButtonRelated>
      <span>{__('See related scoring..')}</span>
    </ButtonRelated>
  );

  const modalContent = props => {
    return <ScoringForm {...props} customerId={mainTypeId}  />;
  };
  const scoringButton = (
    <ModalTrigger
      size="lg"
      title="Customer Scoring"
      trigger={trigger}
      content={modalContent}
    />
  );
  const content = (
    <>
     {scoringButton}

    </>
  );

  return (
    <Box
      title={__(`${title || 'Loan scoring'}`)}
      name="showBurenScoring"
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
}

export default Component
