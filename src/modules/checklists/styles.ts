import { colors, dimensions } from 'modules/common/styles';
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
  align-items: center;

  > h5 {
    margin: 0;
    flex: 1;
    font-size: 13px;
    line-height: 31px;
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
    margin-right: ${dimensions.unitSpacing / 2}px;
    color: ${colors.colorCoreBlack};
  }

  & > div {
    padding: 4px 30px;
  }
`;
const ChecklistWrapper = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;

  > button {
    margin: ${dimensions.unitSpacing}px 0 0 28px;
  }
`;

const ChecklistRow = styled.div`
  padding: ${dimensions.unitSpacing / 2}px;
  border-radius: 2px;
  margin-left: -5px;
  display: flex;

  &:hover {
    background: ${colors.bgActive};
    button {
      opacity: 1;
    }
  }
`;

const ChecklistText = styledTS<{ isChecked?: boolean }>(styled.div)`
  display: inline-flex;
  width: 100%;
  justify-content: space-between;
  margin-left: ${dimensions.unitSpacing}px;
  align-items: flex-start;
  text-decoration: ${props => props.isChecked && 'line-through'};
  color: ${props => props.isChecked && '#666'};

  > button {
    opacity: 0;
    background-color: transparent;
    box-shadow: none;
    padding: 2px ${dimensions.unitSpacing / 2}px;
    border: none;
    margin-left: ${dimensions.unitSpacing / 2}px;
    font-size: 12px;
  }
`;

const FormControlWrapper = styled.div`
  width: 100%;

  textarea {
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: ${dimensions.unitSpacing / 2}px 0;
    margin-bottom: ${dimensions.unitSpacing}px;
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
  ChecklistRow,
  ChecklistText,
  FormControlWrapper,
  FormWrapper,
  PopoverContent,
  ClosePopover
};
