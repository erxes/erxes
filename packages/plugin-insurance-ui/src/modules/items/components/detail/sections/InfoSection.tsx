import { Name, NameContainer } from '@erxes/ui-contacts/src/customers/styles';
import { Label } from '@erxes/ui/src';
import { InfoWrapper } from '@erxes/ui/src/styles/main';
import React from 'react';
import { InsuranceItem } from '../../../../../gql/types';

type Props = {
  item: InsuranceItem;
  children?: React.ReactNode;
  //   refetch: () => void;
};

const IntoSection = (props: Props) => {
  const { item } = props;

  const statusText = item.deal?.stage?.name || 'Unknown';

  return (
    <InfoWrapper>
      <NameContainer>
        <Name fontSize={16}>{item.deal?.number}</Name>
        <Label ignoreTrans={true}>
          <span>{statusText}</span>
        </Label>
      </NameContainer>
      {props.children}
    </InfoWrapper>
  );
};

export default IntoSection;
