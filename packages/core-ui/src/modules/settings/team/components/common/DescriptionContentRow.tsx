import React from 'react';
import { __ } from '@erxes/ui/src';
import { FlexRow, DescriptionContent } from '../../styles';
export function DescriptionContentRow({ label, totalCount, teamMembersCount }) {
  return (
    <FlexRow>
      <DescriptionContent>
        {__(`Total ${label} count`)}
        <h4>{totalCount || 0}</h4>
      </DescriptionContent>
      <DescriptionContent>
        {__('Total team members count')}
        <h4>{teamMembersCount || 0}</h4>
      </DescriptionContent>
    </FlexRow>
  );
}
