import { colors, dimensions } from 'modules/common/styles';
import { SortItem } from 'modules/common/styles/sort';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ChecklistTitleWrapper = styled.div`
  display: flex;
  align-items: baseline;

  > i {
    margin-right: ${dimensions.unitSpacing - 2}px;
  }
`;

const ChecklistTitle = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  width: 100%;
  align-items: baseline;

  > h5 {
    margin: 0;
    flex: 1;
    font-size: 13px;
    padding: 8px 0;
    min-height: 31px;
    word-break: break-word;
  }

  > form {
    width: 100%;
  }
`;

const Progress = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  margin-top: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;

  span {
    font-size: 12px;
    margin-right: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreBlack};
  }

  & > div {
    padding: 4px 30px;
    border-radius: 5px;
  }
`;

const ChecklistWrapper = styled.div`
  margin: 0 0 ${dimensions.coreSpacing}px -8px;

  > button {
    margin: ${dimensions.unitSpacing}px 0 0 36px;
  }

  ${SortItem} {
    background: transparent;
    border: 0;
    margin-bottom: 0;
    padding: 6px ${dimensions.unitSpacing - 2}px;

    &:hover {
      background: rgba(10, 30, 65, 0.05);
      box-shadow: none;
      border-radius: 4px;
    }

    &:empty {
      display: none;
    }
  }
`;

const ChecklistText = styledTS<{ isChecked?: boolean }>(styled.div)`
  display: inline-flex;
  flex: 1;
  justify-content: space-between;
  margin-left: ${dimensions.unitSpacing}px;
  text-decoration: ${props => props.isChecked && 'line-through'};
  color: ${props => props.isChecked && colors.colorCoreGray};

  i {
    cursor: pointer;
    visibility: hidden;
    padding: 0 ${dimensions.unitSpacing / 2}px;

    &:hover {
      color: ${colors.colorCoreRed};
      transition: all ease 0.3s;
    }
  }

  > label {
    width: 100%;
    cursor: pointer;
    word-break: break-word;
  }
`;

const ChecklistItem = styled.div`
  display: flex;
  flex: 1;
  padding-left: ${dimensions.unitSpacing / 2}px;
  border-radius: 2px;
  margin-left: -5px;
  transition: all ease 0.3s;

  &:hover {
    button {
      opacity: 1;
    }

    i {
      visibility: visible;
    }
  }
`;

const FormControlWrapper = styled.div`
  width: 100%;

  textarea {
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: ${dimensions.unitSpacing / 2}px 0;
    margin: ${dimensions.unitSpacing}px 0;
    overflow-y: hidden;
    min-height: auto;
  }
`;

const FormWrapper = styledTS<{ add?: boolean }>(styled.form)`
  width: 100%;
  padding-left: ${props => (props.add ? '28px' : '10px')};
  margin-top: ${props => !props.add && '-5px'};
`;

const PopoverContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ClosePopover = styled.span``;

export {
  ChecklistTitleWrapper,
  ChecklistTitle,
  Progress,
  ChecklistWrapper,
  ChecklistItem,
  ChecklistText,
  FormControlWrapper,
  FormWrapper,
  PopoverContent,
  ClosePopover
};
