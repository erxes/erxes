import { colors, typography } from 'modules/common/styles';
import { SortItem } from 'modules/common/styles/sort';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SidebarListItem } from '../styles';
import { LinkButton } from '../team/styles';

const BoardItem = styledTS<{ isActive: boolean }>(styled(SidebarListItem))`
  overflow: hidden;
  background: ${props => props.isActive && colors.bgActive};
  
  > button {
    padding: 10px 15px 10px 20px;

    i {
      color: ${colors.colorCoreYellow};
    }
  }

  a {
    padding: 10px 20px;
    margin-left: 0;
    border-left: 0;
  }
`;

const PipelineContainer = styled.div`
  h3 {
    text-transform: uppercase;
    color: ${colors.colorCoreLightGray};
    font-size: ${typography.fontSizeUppercase}px;
    padding: 10px 20px;
    margin: 0;
  }

  ${SortItem} {
    z-index: 100;
    margin-bottom: -1px;
    border: 0;
    border-top: 1px solid ${colors.borderPrimary};
    border-bottom: 1px solid ${colors.borderPrimary};
    padding-left: 20px;
    padding-right: 20px;
  }
`;

const PipelineRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  border-top: 1px solid rgb(238, 238, 238);
  padding: 10px 20px;
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

const StageItemContainer = styled(PipelineRowContainer)`
  background-color: ${colors.colorWhite};
  padding: 0;
  border-top: 0;
  align-items: center;

  > *:not(button) {
    margin-right: 10px;
  }

  button {
    padding: 3px;
    font-size: 16px;
  }

  button:hover {
    color: ${colors.colorCoreRed};
  }
`;

const SelectMemberStyled = styled.div`
  position: relative;
  z-index: 2001;
`;

export {
  BoardItem,
  PipelineContainer,
  PipelineRowContainer,
  StageList,
  StageItemContainer,
  SelectMemberStyled
};
