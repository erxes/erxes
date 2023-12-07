import React from 'react';

import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { __ } from 'coreui/utils';
import { Link } from 'react-router-dom';

interface Props {
  loanContracts?: [{ _id: string; number: string }];
}

function LoanContractSection({ loanContracts }: Props) {
  const content = (
    <>
      {loanContracts?.map((contract, index) => (
        <SectionBodyItem key={contract._id}>
          <Link to={`/erxes-plugin-loan/contract-details/${contract._id}`}>
            <Icon icon="arrow-to-right" style={{ marginRight: 5 }} />
            <span>{contract.number || 'Unknown'}</span>
          </Link>
        </SectionBodyItem>
      ))}
      {!loanContracts?.length && (
        <EmptyState icon="building" text="No contract" />
      )}
    </>
  );

  return (
    <Box title={__(`${'Loan Contracts'}`)} name="showContracts" isOpen={true}>
      {content}
    </Box>
  );
}

export default LoanContractSection;
