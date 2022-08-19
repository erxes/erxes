import React from 'react';
import { CollapseBox, Center, SmallText } from '../../styles';
import Icon from 'modules/common/components/Icon';

type Props = {
  navCollapse: number;
  onClickHandleIcon: (event: any) => void;
};

export default function NavigationToggler(props: Props) {
  const { navCollapse, onClickHandleIcon } = props;

  const renderHandleIcon = (type: string): JSX.Element => {
    return (
      <CollapseBox
        onClick={() => {
          onClickHandleIcon(type);
        }}
      >
        <Icon icon={type} />
      </CollapseBox>
    );
  };

  switch (navCollapse) {
    case 1:
      return renderHandleIcon('plus');
    case 3:
      return (
        <Center>
          <SmallText>Collapse</SmallText>
          {renderHandleIcon('minus')}
        </Center>
      );
    default:
      return (
        <>
          {renderHandleIcon('minus')}
          {renderHandleIcon('plus')}
        </>
      );
  }
}
