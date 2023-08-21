import React from 'react';
import styledTS from 'styled-components-ts';
import styled from 'styled-components';
import { colors, dimensions } from '../styles';

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

const ChecklistWrapper = styled.div`
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px 0;

  > button {
    margin: ${dimensions.unitSpacing}px 0 0 36px;
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
export {
  ChecklistText,
  ChecklistTitle,
  ChecklistTitleWrapper,
  Progress,
  ChecklistWrapper,
  ChecklistItem
};
