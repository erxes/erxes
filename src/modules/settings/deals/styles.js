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
        color: ${props => props.isDefault && colors.starColor};
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
    list-style: none;
    margin: 0;
    padding: 0 0 0 20px;

    li {
      float: left;
      padding: 10px 20px 10px 40px;
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
    margin-bottom: 0;
    border: 0;
    border-top: 1px solid rgb(238, 238, 238);
  }
`;

const PipelineRowContainer = styled.div`
  width: 100%;
  label {
    padding: 0 20px 0 5px;
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
