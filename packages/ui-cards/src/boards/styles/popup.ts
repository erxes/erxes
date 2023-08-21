import { colors } from '@erxes/ui/src/styles';
import { darken, lighten } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const buttonColor = name => {
  if (name === 'red') {
    return lighten(colors.colorCoreRed, 10);
  }

  if (name === 'green') {
    return lighten(colors.colorCoreGreen, 10);
  }

  if (name === 'yellow') {
    return lighten(colors.colorCoreYellow, 10);
  }

  if (name === 'blue') {
    return lighten(colors.colorCoreBlue, 10);
  }

  if (name === 'teal') {
    return lighten(colors.colorCoreTeal, 10);
  }

  return colors.colorCoreLightGray;
};

export const Button = styledTS<{
  colorName?: string;
  extra?: boolean;
}>(styled.div)`
  padding: 5px 15px;
  background: ${props => buttonColor(props.colorName)};
  color: #fff;
  border-radius: 16px;
  font-weight: 500;
  transition: background 0.3s ease;
  display: inline-block;
  text-align: center;

  &:hover {
    background: ${props => darken(buttonColor(props.colorName), 10)};
    cursor: pointer;
  }
  
  ${props => props.extra && 'padding-left: 40px;'}
`;

export const CloseDateLabel = styled(Button)`
  width: 72px;
  padding: 3px 0;
  line-height: 1em;
  margin-top: 4px;
  margin-left: 10px;
`;

export const StartDateLabel = styled(Button)`
  width: 72px;
  padding: 3px 0;
  line-height: 1em;
  margin-top: 4px;
`;

export const CheckBoxWrapper = styled.span`
  margin-left: 10px;
`;

export const CalenderWrapper = styled.div`
  width: 250px;
  margin-bottom: 20px;
`;

export const CloseDateWrapper = styled.div`
  margin-top: 6px;
  position: relative;
  text-align: right;
  margin-left: 20px;
  flex-shrink: 0;
`;

export const CloseDateContent = styled.div`
  padding: 30px;
  max-height: 100vh;
  overflow: auto;
`;

export const DateGrid = styled.div`
  margin: 0 0 20px;
  display: flex;

  div {
    flex: 1;

    input {
      border-radius: 4px;
      display: block;
      border: 2px solid ${colors.borderPrimary};
      padding: 4px 8px;
    }

    input[type='time']::-webkit-calendar-picker-indicator {
      display: none;
    }

    input[type='date']::-webkit-inner-spin-button,
    input[type='date']::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
    }

    &:first-child {
      margin-right: 10px;
    }
  }

  &:last-child {
    margin: 20px 0 0;
  }
`;
