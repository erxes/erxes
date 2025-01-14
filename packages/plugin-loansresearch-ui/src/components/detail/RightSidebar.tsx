import Box from '@erxes/ui/src/components/Box';
import { ILoanResearch } from '../../types';
import { List } from '../../styles';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from '@erxes/ui/src';
import dayjs from 'dayjs';

type Props = {
  loansResearch: ILoanResearch;
};

const RightSidebar = (props: Props) => {
  const { loansResearch } = props;

  return (
    <Sidebar>
      <Box title={__('Other')} name="showOthers">
        <List>
          <li>
            <div>{__('Created at')}: </div>{' '}
            <span>{dayjs(loansResearch.createdAt).format('lll')}</span>
          </li>
          <li>
            <div>{__('Modified at')}: </div>{' '}
            <span>{dayjs(loansResearch.modifiedAt).format('lll')}</span>
          </li>
        </List>
      </Box>
    </Sidebar>
  );
};

export default RightSidebar;
