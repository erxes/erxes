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

  if (name === 'yellow') {
    return colors.colorCoreYellow;
  }

  return colors.colorCoreLightGray;
};

export const Button = styledTS<{
  colorName?: string;
  extra?: boolean;
}>(styled.div)`
  padding: 8px 16px;
  background: ${props => buttonColor(props.colorName)};
  color: #fff;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.3s ease;
  display: inline-block;
  text-align: center;

  &:hover {
    background: ${props => rgba(buttonColor(props.colorName), 0.72)};
    cursor: pointer;
  }
  
  ${props => props.extra && 'padding-left: 40px;'}
`;

export const CloseDateLabel = styled(Button)`
  width: 72px;
  padding: 5px 0;
  line-height: 1em;
  margin-top: 4px;
`;

export const CheckBoxWrapper = styled.span`
  margin-right: 6px;
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
`;

export const DateGrid = styled.div`
  margin: 0 0 20px;
  display: flex;

  div {
    flex: 1;

    span {
      border-radius: 4px;
      display: block;
      border: 2px solid ${colors.borderPrimary}
      padding: 4px;
    }
    
    &:first-child {
      margin-right: 10px;
    }
  }

  &:last-child {
    margin: 20px 0 0;
  }
`;
