import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { FlexCenter } from '../../common/styles/main';
import Icon from '../../common/components/Icon';
import { dimensions } from '../../common/styles';

const Wrapper = styledTS<{ isPortrait?: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
  margin: ${props => props.isPortrait && '10px 0 20px 0'};


  > input {
    font-size: ${props => (props.isPortrait ? '28px' : '12px')};
    color: #616e7c;
    border: 1px solid #cbd2d9;
    border-radius: 4px;
    padding: 0 ${dimensions.unitSpacing - 5}px;
    font-weight: 500;
    min-width: 32px;
    margin:  ${props => (props.isPortrait ? '0 20px' : '0')};
    text-align: center;
  }
`;

const Button = styledTS<{
  disabled: boolean;
  color?: string;
  isPortrait?: boolean;
}>(styled(FlexCenter))`
  width: 20px;
  height: 20px;
  margin: 0 8px;
  font-size: ${props => (props.isPortrait ? '26px' : '11px')};
  color: #616E7C;
  pointer-events: ${props => props.disabled && 'none'};
  cursor: pointer;

  i {
    &:before {
      font-weight: bolder;
    }

    &.icon-plus {
      color: ${props => (props.color ? props.color : '#6569df')};
    }
  }
`;

type Props = {
  step?: number;
  max?: number;
  value: number;
  color: string;
  onChange: (value: number) => void;
  isPortrait?: boolean;
};

const formatNumber = (num: number) => {
  return (num || 0).toLocaleString(undefined, {
    maximumFractionDigits: 5
  });
};

const Quantity = (props: Props) => {
  const { value, step = 1, onChange, max, color, isPortrait } = props;
  const [inputValue, setInputValue] = useState(formatNumber(value));
  const widthValue = isPortrait ? 54 : 24;

  useEffect(() => {
    setInputValue(formatNumber(value));
  }, [value]);

  let changedValue = value;

  const isDisabled = (up: boolean) => {
    const checkValue = up ? max : 0;

    if (changedValue === checkValue) {
      return true;
    }

    return false;
  };

  const changeValue = (val: number) => {
    setInputValue(formatNumber(val));
    onChange(val);
  };

  const onChangeInput = e => {
    // convert and clean string value
    changeValue(parseInt(e.target.value));
  };

  const onChangeByStep = (increase: boolean) => {
    if (increase) {
      changedValue = value + step;
    } else {
      changedValue = value - step;
    }

    changeValue(changedValue);
  };

  return (
    <Wrapper isPortrait={isPortrait}>
      <Button
        disabled={isDisabled(true)}
        onClick={() => onChangeByStep(true)}
        color={color}
        isPortrait={isPortrait}
      >
        <Icon icon="plus" />
      </Button>
      <input
        style={{ width: inputValue.length * 9 + widthValue + 'px' }}
        type="text"
        value={inputValue}
        onChange={onChangeInput}
      />
      <Button
        disabled={isDisabled(false)}
        onClick={() => onChangeByStep(false)}
        isPortrait={isPortrait}
      >
        <Icon icon="minus" />
      </Button>
    </Wrapper>
  );
};

export default Quantity;
