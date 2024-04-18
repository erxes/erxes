import {
    __,
    EmptyState,
    SectionBodyItem
} from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { readFile } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';
import { InsuranceItem } from '../../../../../gql/types';

type Props = {
  item: InsuranceItem;
};

const ContractsSection = (props: Props) => {
  const { item } = props;
  const { contracts = [] } = item as any;

  const onClick = (link) => {
    return window.open(readFile(link));
  };

  const content = (
    <>
      {!contracts.length ? (
        <EmptyState icon="user" text="No contracts" />
      ) : (
        contracts.map((contract: any, index: number) => {
          return (
            <SectionBodyItem key={index}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={readFile(contract.url)}
              >
                {dayjs(contract.date).format('YYYY-MM-DD HH:mm')}
              </a>
            </SectionBodyItem>
          );
        })
      )}
    </>
  );

  return (
    <Box
      title={__('Contracts')}
      name="contracts"
      // extraButtons={quickButtons}
      isOpen={true}
    >
      {content}
    </Box>
  );
};

export default ContractsSection;
