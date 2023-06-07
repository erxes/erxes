import { colors, dimensions } from '@erxes/ui/src';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { Contents } from '@erxes/ui/src/layout/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';

import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column } from '@erxes/ui/src/styles/main';

export const RoundButton = styled.button`
  width:30px;
  height:30px;
  border-radius:50px;
  border:0;
  cursor:pointer;
  color:${colors.colorWhite}
  background-color:${colors.colorLightGray}
  &:hover{
    background-color:${colors.colorCoreGray}
  }
`;

export const TreeCard = styledTS<{
  color?: string;
}>(styled.div)`
  padding:10px 20px;
  background-color:${({ color }) => (color ? color : colors.colorLightGray)}
  color:${colors.colorWhite}
  border-radius:15px;
  font-size:15px;
  margin-top:5rem;
  text-align:center;
  width:250px
    .content{
    background-color:white;
    border-radius:15px;
    > h5{
      color:${colors.colorBlack}
    }
    > p{
      color:${colors.colorLightGray}
    }
  }
`;

export const StyledContent = styled.div`
  padding: 0 1rem;
`;

export const StyledListItem = styled.div`
  padding: 10px;
`;
export const Divider = styled.div`
  text-align: center;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${colors.colorCoreLightGray};
  margin: 20px 0;

  > span {
    margin: 0 20px;
  }

  &:before,
  &:after {
    content: '';
    flex: 1;
    height: 0;
    align-self: center;
    border-bottom: 1px solid ${colors.borderPrimary};
  }
`;

export const SidebarHeader = styled.h5`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorPrimary};
  padding-left: 10px;
`;
export const ListItem = styledTS<{
  column?: number;
}>(styled.div)`
  display:flex;
  justify-content:space-between;
  background: ${colors.colorWhite};
  padding: 5px;
  margin-bottom: 10px;
  border-left: 2px solid transparent; 
  border-top: none;
  border-radius: 4px;
  box-shadow: none;
  left: auto;
  align-items:center;
  padding:20px 10px

  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: 0 2px 8px ${colors.shadowPrimary};
    border-color: ${colors.colorSecondary};
    border-top: none;
    cursor: pointer;
  }
  ${props =>
    props.column &&
    css`
      width: ${100 / props.column}%;
      display: inline-block;
    `}
`;

export const ItemBtn = styledTS<{
  color?: string;
}>(styled.div)`
  color: ${({ color }) => (color ? color : '')};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

export const TriggerTabs = styled.div`
  box-shadow: 0 2px 8px ${colors.shadowPrimary};
  margin-bottom:10px;
  .hxZkUW {
    border: 1px solid ${colors.borderPrimary};
    border-radius: 5px;
    padding: 2px;

    > span {
      flex: 1;
      flex-shrink: 0;
      text-align: center;
      font-weight: 500;
      padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing}px
      border-radius: ${dimensions.unitSpacing - 5}px;
      border-right: 1px solid ${colors.colorCoreGray}

      &.active {
        background: ${colors.colorSecondary};
        color: ${colors.colorWhite};

        &:before {
          display: none;
        }
      }
    }
  }
`;

export const TabCaption = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TabAction = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  color: ${colors.colorCoreGray};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;
export const IssueItem = styled.div`
  background-color: #0000000f;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
`;

export const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 10px;
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

export const EndDateContainer = styled.div`
  .rdtPicker {
    left: -98px !important;
  }
`;

export const HeightedWrapper = styled.div`
  flex: 1;
  position: relative;
`;

export const AutomationFormContainer = styled(Contents)`
  margin: 0;

  > section {
    margin: 0;
  }
`;

export const BackButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 35px;
  line-height: 35px;
  background: rgba(0, 0, 0, 0.12);
  text-align: center;
  margin-right: ${dimensions.unitSpacing}px;
  color: ${colors.textPrimary};
  transition: all ease 0.3s;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.18);
  }
`;

export const RCFAEndPoint = styled.div`
  position: absolute;
  width: 300px;
  height: 100px;
  display: inline;
  background-color: red;
  padding: 0.5rem;
  cursor: pointer;
  background: rgb(245, 245, 245);
  border: 1px solid rgb(238, 238, 238);
  border-radius: 8px;
  margin-left: 20px;

  p {
    text-align: center;
    margin-bottom: 0;
  }
`;
export const Container = styled.div`
  padding: ${dimensions.coreSpacing}px;
  height: 100%;
  overflow: auto;
  background-image: radial-gradient(
    ${colors.bgActive} 20%,
    ${colors.colorWhite} 20%
  );
  background-size: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px;
  #canvas {
    display: flex;
    position: relative;
    flex-direction: row;
    height: 100%;
    }
  }

  .jtk-connector {
    z-index: 4;
  }

  .jtk-endpoint {
    z-index: 5;
  }

  .jtk-overlay {
    z-index: 6;
  }
`;

export const ZoomActions = styled.div`
  position: absolute;
  font-size: 11px;
  z-index: ${dimensions.unitSpacing};

  > .icon-wrapper {
    display: table;
    border: 1px solid ${colors.borderDarker};
    border-radius: ${dimensions.unitSpacing - 6}px;
    margin-bottom: ${dimensions.unitSpacing - 5}px;
  }
`;
export const ZoomIcon = styledTS<{ disabled: boolean }>(styled.div)`
  width: ${dimensions.coreSpacing}px;
  height: ${dimensions.coreSpacing}px;
  line-height: ${dimensions.coreSpacing}px;
  text-align: center;
  background: ${props =>
    props.disabled ? colors.bgActive : colors.colorWhite};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  margin: 0;
  transition: all ease .3s;

  > i {
    font-weight: 500;
    font-size: 11px;

    &:before {
      font-weight: 700;
    }
  }

  &:first-child {
    border-bottom: 1px solid ${colors.borderDarker};
    padding-bottom: 3px;
  }

  &:hover {
    background: ${colors.bgLight};
    opacity: .8;
  }
`;

export const CustomColumns = styled(Columns)`
  flex-wrap: nowrap;
`;

export const CustomColumn = styled(Column)`
  margin: 15px;
  text-align: -webkit-center;
`;
