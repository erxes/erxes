import { colors, typography } from 'modules/common/styles';
import { SortItem } from 'modules/common/styles/sort';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { SidebarListItem } from '../styles';

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
`;

const StageList = styled.div`
  > button {
    margin-top: 10px;
  }
`;

const StageItemContainer = styled(PipelineRowContainer)`
  align-items: center;

  > *:not(button) {
    margin-right: 10px;
  }

  button {
    padding: 5px 8px;
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
