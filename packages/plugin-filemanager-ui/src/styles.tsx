import { colors, dimensions } from '@erxes/ui/src/styles';

import { BoxRoot } from '@erxes/ui/src/styles/main';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const ActionItem = styled.button`
  width: 100%;
  text-align: left;
  min-width: 150px;
  background: none;
  outline: 0;
  border: 0;
  overflow: hidden;

  > i {
    color: ${colors.colorCoreGreen};
    float: right;
  }
`;

export const FlexContainer = styledTS<{ direction?: string }>(styled.div)`
  display: flex;
  justify-content: space-between;
  flex-direction: ${props => props.direction};
`;

export const FileUpload = styled.div`
  input {
    display: none;
  }
`;

export const IconWrapper = styledTS<{ color?: string }>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    color: ${props => (props.color ? props.color : colors.colorSecondary)};
  }
`;

export const ChooseBox = styled(BoxRoot)`
  width: 200px;
  padding: 30px;
  margin: 0;
  background: ${colors.bgLight};

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    font-size: 14px;
    text-transform: capitalize;
  }
`;

export const ItemName = styled.div`
  display: flex;
  align-items: center;

  img {
    width: ${dimensions.coreSpacing}px;
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

export const ActionButton = styledTS<{ color?: string }>(styled.div)`
  height: 25px;
  border-radius: 2px;
  font-weight: 500;
  line-height: 25px;
  font-size: 12px;
  background-color: ${props => rgba(props.color || colors.colorPrimary, 0.1)};
  color: ${props => props.color || colors.colorPrimaryDark};
  padding: 0 10px;
  transition: background 0.3s ease;
  > i {
    margin-right: 5px;
  }
  > span {
    margin-right: 5px;
  }
  &:hover {
    cursor: pointer;
    background-color: ${props => rgba(props.color || colors.colorPrimary, 0.2)};
  }
`;
