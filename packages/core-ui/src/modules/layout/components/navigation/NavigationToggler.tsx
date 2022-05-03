import React from "react";
import {
  CollapseBox,
  Center,
  SmallText
} from '../../styles';
import Icon from "modules/common/components/Icon";

type Props = {
  navCollapse: number;
  onClickHandleIcon: (e) => void;
};

function NavigationToggler(props: Props) {
  const { onClickHandleIcon, navCollapse } = props;

  function renderHandleIcon(type: string) {
    return (
      <CollapseBox
        onClick={() => {
          onClickHandleIcon(type);
        }}
      >
        <Icon icon={type} />
      </CollapseBox>
    )
  }

  switch (navCollapse) {
    case 1:
      return renderHandleIcon("plus");
    case 3:
      return (
        <Center>
          <SmallText>Collapse</SmallText>
          {renderHandleIcon("minus")}
        </Center>
      );
    default:
      return (
        <>
          {renderHandleIcon("minus")}
          {renderHandleIcon("plus")}
        </>
      );
  }
}

export default NavigationToggler;