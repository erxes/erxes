import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const buttonColor = name => {
  if (name === 'red') {
    return colors.colorCoreRed;
  }

  if (name === 'green') {
    return colors.colorCoreGreen;
  }

  return colors.colorCoreLightGray;
};

export const Button = styledTS<{ colorName?: string; extra?: boolean }>(
  styled.div
)`
  position: relative;
  padding: 8px 16px;
  background: ${props => buttonColor(props.colorName)};
  color: #fff;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.3s ease;
  display: inline-block;

  &:hover {
    background: ${props => rgba(buttonColor(props.colorName), 0.72)};
    cursor: pointer;
  }
  
  ${props => props.extra && 'padding-left: 40px;'}
`;

export const CheckBoxWrapper = styled.div`
  position: absolute;
  top: 8px;
  left: 16px;
  z-index: 9;
`;

export const CalenderWrapper = styled.div`
  width: 250px;
  height: 290px;
  margin-bottom: 20px;
`;

export const CloseDateWrapper = styled.div`
  margin-top: 6px;
  position: relative;
`;

export const ShowDate = styled.div`
  margin-bottom: 20px;
  display: flex;

  div {
    flex: 1;

    span {
      display: block;
      border: 2px solid ${colors.borderPrimary}
      padding: 4px;
    }
    
    &:first-child {
      span {
        width: 90%;
      }
    }
  }
`;
