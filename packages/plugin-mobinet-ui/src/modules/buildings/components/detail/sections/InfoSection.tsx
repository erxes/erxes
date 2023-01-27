import { Name, NameContainer } from '@erxes/ui-contacts/src/customers/styles';
import { Icon, Label, ModalTrigger } from '@erxes/ui/src';
import { InfoWrapper } from '@erxes/ui/src/styles/main';
import React from 'react';

import BuildingForm from '../../../containers/Form';
import { IBuilding } from '../../../types';

type Props = {
  building: IBuilding;
  children?: React.ReactNode;
};

const IntoSection = (props: Props) => {
  const { building } = props;

  let statusText = 'Сүлжээ нэвтрээгүй';

  switch (building.serviceStatus) {
    case 'active':
      statusText = 'Сүлжээ нэвтэрсэн';
      break;
    case 'inactive':
      statusText = 'Сүлжээ нэвтрээгүй';
      break;
    case 'inprogress':
      statusText = 'Нэвтрүүлэлт хийгдэж буй';
      break;
    default:
      statusText = 'Сүлжээ нэвтрээгүй';
      break;
  }

  const content = props => <BuildingForm {...props} building={building} />;

  return (
    <>
      <InfoWrapper>
        <NameContainer>
          <Name fontSize={16}>
            {building.name}
            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="pen-1" />}
              size="lg"
              content={content}
            />
          </Name>
          <Label lblColor={building.color} ignoreTrans={true}>
            <span>{statusText}</span>
          </Label>
        </NameContainer>

        {props.children}
      </InfoWrapper>
    </>
  );
};

export default IntoSection;
