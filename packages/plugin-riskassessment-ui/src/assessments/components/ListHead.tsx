import React from 'react';
import styled from 'styled-components';
import { DetailPopOver } from '../common/utils';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { colors } from '@erxes/ui/src';

const THeadContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-inline-start: auto;
  align-items: center;
`;

const ActionBar = styled(ModalFooter)`
  margin-top: 0px;
`;

type Props = {
  children: any;
  filter?: any;
  sort?: any;
};

export function TableHead({ children, filter, sort }: Props) {
  return (
    <th>
      <THeadContainer>
        {sort && sort}
        {children}
        {filter && (
          <DetailPopOver
            title=""
            withoutPopoverTitle
            icon="filter-1"
            iconColor={filter?.actionBar && colors.colorCoreBlue}
          >
            <ActionBar>{filter?.actionBar}</ActionBar>
            {filter?.main}
          </DetailPopOver>
        )}
      </THeadContainer>
    </th>
  );
}
