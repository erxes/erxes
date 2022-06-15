import { colors, dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SidebarListItem } from '../styles';
import { LinkButton } from '@erxes/ui/src/styles/main';
import { HeaderContent } from '@erxes/ui-cards/src/boards/styles/item';

const BoardItem = styledTS<{ isActive: boolean }>(styled(SidebarListItem))`
  overflow: hidden;
  
  > button {
    padding: 10px 15px 10px 20px;

    i {
      color: ${colors.colorCoreYellow};
    }
  }

  a {
    // margin: 10px 20px 0 20px;
    // padding-bottom: 10px;
    // margin-left: 0;
    // border-left: 0;
  }
`;

const StageList = styled.div`
  background: ${colors.colorWhite};
  padding: 20px;
  margin-top: 10px;
  box-shadow: 0 2px 8px ${colors.shadowPrimary};

  ${LinkButton} {
    margin: 20px 0 0 30px;
    display: block;
  }
`;

const StageItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  background-color: ${colors.colorWhite};
  padding: 0;
  align-items: center;

  > *:not(button) {
    margin-right: 10px;
  }

  .Select {
    width: 200px;
  }

  button {
    padding: 3px;
    font-size: 16px;
    margin: 0;
  }

  button:hover {
    color: ${colors.colorCoreRed};
  }
`;

const SelectMemberStyled = styledTS<{ zIndex?: number }>(styled.div)`
  position: relative;
  z-index: ${props => (props.zIndex ? props.zIndex : '2001')};
`;

const PipelineCount = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: #666;
  margin-top: 2px;
  margin-left: 10px;
`;

const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  max-height: 200px;
  min-width: 200px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  > div {
    padding: 0;
  }

  b {
    margin-bottom: ${dimensions.unitSpacing + 10}px;
    color: black;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    font-weight: 400;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

const BoardHeader = styled(HeaderContent)`
  .header-row {
    display: flex;
    justify-content: space-between;

    > div > span {
      color: ${colors.colorSecondary};
      font-weight: 500;
      cursor: pointer;
      margin-left: ${dimensions.unitSpacing}px;
    }
  }
`;

export {
  BoardItem,
  StageList,
  StageItemContainer,
  SelectMemberStyled,
  PipelineCount,
  Attributes,
  BoardHeader
};
