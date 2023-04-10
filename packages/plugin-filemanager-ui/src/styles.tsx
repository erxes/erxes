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

export const LeftActionbar = styled.div`
  ul {
    margin-right: 10px;
  }
`;

export const ItemName = styled.div`
  a {
    display: flex;
    align-items: center;
    color: ${colors.textPrimary};
  }

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

export const RightMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  top: 117px;
  right: 21px;
  bottom: 0;
  width: 350px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
`;

export const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;

  > div {
    flex: 1;
    margin-right: 8px;

    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

export const FilterWrapper = styled.div`
  flex: 1;
  padding: ${dimensions.coreSpacing}px;

  .Select {
    margin-bottom: 15px;
  }

  input {
    margin-bottom: 20px;
    width: 100% !important;
  }
`;
