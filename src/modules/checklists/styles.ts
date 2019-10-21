import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
const ChecklistTitleWrapper = styled.div`
  display: flex;
  align-items: baseline;
  > i {
    margin-right: ${dimensions.unitSpacing}px;
    font-size: 18px;
  }
`;

const ChecklistTitle = styled.div`
  display: flex;
  justify-content: space-between;
  flex-flow: row wrap;
  width: 100%;
  align-items: center;
  > h5 {
    margin-top: 0;
    line-height: 1.5;
  }
`;

const ChecklistActions = styled.div`
  margin: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px auto;
  > button {
    text-transform: initial;
  }
`;

const Progress = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  margin-top: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
  span {
    font-size: 12px;
    margin-right: ${dimensions.unitSpacing / 2}px;
    color: ${colors.colorCoreBlack};
  }
  & > div {
    padding: 4px 30px;
  }
`;
const ChecklistWrapper = styled.div`
    margin-bottom: ${dimensions.unitSpacing * 3}px;
    overflow-hidden;
    > button{
        margin: ${dimensions.unitSpacing}px 0 0 28px;
    },kjjjjjuujjuju
`;

const ChecklistRow = styled.div`
    padding: ${dimensions.unitSpacing / 2}px;
    margin-left: -5px;
    display: flex;
    &:hover {
        background: ${colors.bgActive};
        button { opacity: 1; }
    }
  }
`;

const ChecklistText = styled.div`
  display: inline-flex;
  width: 100%;
  justify-content: space-between;
  margin-left: ${dimensions.unitSpacing}px;
  align-items: flex-start;
  > label {
    float: left;
  }
  > button {
    opacity: 0;
    background-color: transparent;
    box-shadow: none;
    padding: 2px ${dimensions.unitSpacing / 2}px;
    border: none;
    margin-left: ${dimensions.unitSpacing / 2}px;
  }
`;

const FormWrapper = styledTS<{ isNewItem?: boolean }>(styled.form)`
    width: 100%;
    padding-left: ${props => (props.isNewItem ? 28 : dimensions.unitSpacing)}px;
    textarea{
        border: 1px solid ${colors.colorShadowGray};
        padding: ${dimensions.unitSpacing / 2}px;
        margin-bottom: ${dimensions.unitSpacing}px;
        overflow-y: hidden;
        &:hover  {
            border: 1px solid ${colors.colorShadowGray};
        }
        min-height: auto;
    }
`;

const PopoverContent = styled.div`
  padding: ${dimensions.unitSpacing}px;
  h5 {
    padding-bottom: ${dimensions.unitSpacing}px;
    border-bottom: 1px solid ${colors.borderDarker};
  }
  input {
    border: 1px solid ${colors.borderDarker};
    padding: ${dimensions.unitSpacing / 2}px;
  }
  label {
    text-transform: capitalize;
  }
`;

const ClosePopover = styled.span``;

export {
  ChecklistTitleWrapper,
  ChecklistTitle,
  ChecklistActions,
  Progress,
  ChecklistWrapper,
  ChecklistRow,
  ChecklistText,
  FormWrapper,
  PopoverContent,
  ClosePopover
};
