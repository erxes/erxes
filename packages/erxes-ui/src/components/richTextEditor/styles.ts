import styled from 'styled-components';

const RichTextEditorWrapper = styled.div<{ $position: string }>`
  position: relative;
  background: #fff;
  overflow-y: hidden;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  .cm-editor.cm-focused {
    outline: none;
  }

  .Select-menu-outer {
    ${({ $position }) =>
      $position === 'bottom' &&
      `
    bottom: 100% !important;
    top: auto !important;
  `}
  }
`;

const ProseMirrorWrapper = styled.div`
   {
    overflow-y: auto;
  }
`;

const VariableWrapper = styled.div`
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0.375rem;
  border-style: solid;
  border-width: 1px;
  border-color: #93c5fd;
  line-height: 1;
  background-color: #f1f5f9;
`;

const VariableListWrapper = styled.div`
  z-index: 50;
  padding: 0.25rem;
  border-radius: 0.375rem;
  border-width: 1px;
  border-color: #e5e7eb;
  border-style: solid;
  height: auto;
  background-color: #ffffff;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const VariableListBtn = styled.button<{ $focused?: boolean }>`
  display: flex;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-style: none;
  border-radius: 0.375rem;
  width: 100%;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: left;
  color: #111827;
  background-color: ${({ $focused }) => ($focused ? '#f3f4f6' : '#fff')};

  &:hover {
    cursor: pointer;
    background-color: #f3f4f6;
  }
`;

const VariableLabel = styled.label`
  display: block;
  margin-top: 0.375rem;
  width: 100%;
  line-height: 1;
  > span {
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 400;
    line-height: 1;
  }
  > input {
    display: flex;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    border-radius: 0.375rem;
    border-width: 1px;
    border-color: #e5e7eb;
    border-style: solid;
    --ring-offset-color: #ffffff;
    width: 100%;
    height: 2.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    background-color: #ffffff;
  }
`;

export {
  RichTextEditorWrapper,
  ProseMirrorWrapper,
  VariableWrapper,
  VariableListWrapper,
  VariableListBtn,
  VariableLabel,
};
