import styled from 'styled-components';
import { colors } from '../../../styles';
import { rgba } from '../../../styles/ecolor';

const EditorControl = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 0.0625rem solid #ced4da;
  color: ${colors.textPrimary};
  cursor: pointer;
  height: 1.75rem;
  padding: 0.25rem;
  width: 1.75rem;

  &:hover,
  &.is-active {
    background-color: #f8f9fa;
  }

  &[data-rich-text-editor-control] {
    border-radius: 0;
    &:not(:last-of-type) {
      border-right: 0;
    }
    &:first-of-type {
      border-bottom-left-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
    }
    &:last-of-type {
      margin-right: 0;
      border-bottom-right-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
    }
  }
  &[data-active='true'] {
    color: ${colors.colorSecondary};
    background-color: ${rgba(colors.colorSecondary, 0.15)};
  }
`;
const LinkWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 0.0625rem solid #ced4da;
  border-radius: 0.25rem;
  color: ${colors.textPrimary};
  cursor: pointer;
  padding: 0.5rem;
  z-index: 9999;
  > button {
    height: 2.25rem;
    min-height: 2.25rem;
    background-color: #fff;
    border: 0.0625rem solid #ced4da;
    color: ${colors.textPrimary};
    cursor: pointer;
    outline: none;
    font-weight: 600;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 0.25rem;
    border: 0.0625rem solid #ced4da;
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    &:hover,
    &.is-active {
      background-color: #f8f9fa;
    }
  }
`;
const ImageInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  background-color: #fff;
  color: ${colors.textPrimary};
`;
const InputWrapper = styled.div`
  position: relative;
`;
const FormItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  > label {
    color: rgba(34, 47, 62, 0.7);
  }
  > div {
    width: 100%;
    > input {
      flex-grow: 1;
    }
  }
`;
const FormActionWrapper = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
  padding: 0.5rem 1rem;
`;
const LinkInput = styled.input`
  border: 0.0625rem solid #ced4da;
  border-radius: 0.25rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  height: 2.25rem;
  min-height: 2.25rem;
  color: #000;
  outline: none;
  padding: 0 2.35rem 0 0.25rem;
  &:focus {
    border: 0.0625rem solid ${rgba(colors.colorSecondary, 0.55)};
  }
  &::placeholder {
    color: #adb5bd;
  }
`;
const ImageHandlingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Input = styled.input`
  border: 0.0625rem solid #ced4da;
  border-radius: 0.25rem;
  height: 2.25rem;
  min-height: 2.25rem;
  color: #000;
  outline: none;
  padding: 0 0.25rem;
  &:focus {
    border: 0.0625rem solid ${rgba(colors.colorSecondary, 0.55)};
  }
  &::placeholder {
    color: #adb5bd;
  }
`;
const InputAction = styled.div`
  position: absolute;
  right: 0.3rem;
  top: 0.3rem;
  > button {
    cursor: pointer;
    background-color: #fff;
    border: 0.0625rem solid #ced4da;
    border-radius: 0.25rem;
    padding-top: 0.2rem;
    &[data-active='true'] {
      color: ${colors.colorSecondary};
      background-color: ${rgba(colors.colorSecondary, 0.15)};
    }
  }
`;

const FileInputAction = styled.div`
  > div {
    cursor: pointer;
    background-color: #fff;
    border: 0.0625rem solid #ced4da;
    border-radius: 0.25rem;
    padding-left: 0.55rem;
    padding-right: 0.5rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
  }
  label {
    &:hover {
      cursor: pointer;
    }
  }
  input[type='file'] {
    display: none;
  }
`;
const FontSelectWrapper = styled.div`
  .Select {
    border: 0.0625rem solid #ced4da;
    border-radius: 0.25rem;
    height: 1.75rem;
  }
  .Select-clear-zone {
    display: none;
  }
  .Select-input {
    z-index: 10;
    position: absolute;
  }
  .Select-control {
    width: 56px;
    border-bottom: none;
  }
  .Select-arrow-zone {
    top: -3px;
  }
  .Select--single > .Select-control .Select-value {
    padding-left: 0;
    padding-right: 0;
    top: -4px;
    left: 15px;
  }
  .Select-input > input {
    color: transparent;
    text-shadow: 0 0 0 #2196f3;

    &:focus {
      outline: none;
    }
  }
  .Select-menu-outer {
    z-index: 100;
    width: max-content;
  }
  .Select-option {
    padding: 4px 8px;
  }
  .Select-placeholder {
    top: -4px;
    left: 9px;
  }
`;

export {
  EditorControl,
  LinkWrapper,
  LinkInput,
  InputAction,
  InputWrapper,
  FontSelectWrapper,
  FileInputAction,
  ImageInputWrapper,
  Input,
  FormItemWrapper,
  ImageHandlingForm,
  FormActionWrapper
};
