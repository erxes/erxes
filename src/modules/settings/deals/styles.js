import styled from 'styled-components';
import { colors, typography } from 'modules/common/styles';
import { SortItem } from 'modules/common/styles/sort';
import { SidebarListItem } from '../styles';

const BoardRowContainer = styled.div`
  ${SidebarListItem} {
    overflow: hidden;
    > button {
      float: left;
      padding: 12px 15px 12px 20px;
      i {
        color: ${props => props.selected && colors.starColor};
      }
    }
    a {
      float: left;
      width: 80%;
      padding: 10px 20px 10px 0;
      margin-left: 0;
      border-left: 0;
    }
  }
`;

const PipelineContainer = styled.div`
  ul {
    width: 100%;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      margin-bottom: 0;
      border: 0;
      border-top: 1px solid rgb(238, 238, 238);
    }
  }

  ul.head {
    li {
      float: left;
      padding: 10px 20px;
      &:last-child {
        float: right;
      }
      span {
        text-transform: uppercase;
        color: ${colors.colorCoreLightGray};
        font-size: ${typography.fontSizeUppercase}px;
        font-weight: bold;
      }
    }
  }

  ${SortItem} {
    z-index: 100;
  }
`;

const PipelineRowContainer = styled.div`
  width: 100%;
  > div {
    float: right;
  }
`;

const StagesContainer = styled.div`
  > button {
    margin-top: 20px;
  }
`;

const StageItemContainer = styled.div`
  width: 100%;
  input {
    float: left;
    width: 185px;
  }
  div {
    float: left;
    margin-left: 30px;
    width: 185px;
  }
  button {
    float: right;
    margin-top: 5px;
  }
`;

export {
  BoardRowContainer,
  PipelineContainer,
  PipelineRowContainer,
  StagesContainer,
  StageItemContainer
};
