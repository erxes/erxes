import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';

const coreSpace = `${dimensions.coreSpacing}px`;
const colorLightPurle = '#ece6f8';

const ContentBox = styled.div`
  padding: ${coreSpace};
`;

const DragHandler = styled.span`
  cursor: move;
  position: absolute;
  top: 8px;
  right: 20px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  opacity: 1;
  visibility: visible;
  border: 1px solid ${colors.borderPrimary};
  box-shadow: 0 0 4px ${colors.shadowPrimary};
  transition: all 0.3s ease;

  i {
    margin: 0;
    font-size: 16px;
  }
`;

const DragableItem = styled.div`
  padding: ${dimensions.unitSpacing}px ${coreSpace};
  position: relative;
  background: ${colors.colorWhite};
  box-shadow: 0 2px 10px -3px rgba(0, 0, 0, 0.5);

  &:hover ${DragHandler} {
    opacity: 1;
    visibility: visible;
  }
`;

const PreviewForm = styled.div`
  background: ${colorLightPurle};
  overflow: hidden;

  ${DragableItem} {
    box-shadow: none;
  }

  ${DragHandler} {
    opacity: 0;
    visibility: hidden;
  }
`;

const BuildFooter = styled.div`
  padding: 0 ${coreSpace};
  background: ${colors.bgLight};
  border-top: 1px solid ${colors.borderPrimary};
  height: ${dimensions.headerSpacing}px;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  label {
    margin-bottom: 0;
    margin-right: ${coreSpace};
  }
`;

const FieldItem = styled.div`
  &:hover {
    cursor: pointer;
  }

  input,
  textarea,
  select {
    border: 1px solid ${colors.colorShadowGray};
    border-radius: 4px;
    display: block;
    outline: 0;
    height: 34px;
    padding: 8px 14px;
    width: 100%;
    background: transparent;
    margin-top: 10px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }

  input[type='checkbox'],
  input[type='radio'] {
    width: auto;
    height: auto;
    display: inline-block;
    margin-right: 7px;
    padding: 0;
  }

  textarea {
    overflow: auto;
    height: auto;
  }
`;

const Label = styled.label`
  display: inline-block;
  max-width: 100%;
  margin-bottom: 0;
  font-weight: 500;
`;

export {
  ContentBox,
  PreviewForm,
  BuildFooter,
  DragableItem,
  FieldItem,
  Label,
  DragHandler
};
