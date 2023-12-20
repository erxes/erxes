import styled from 'styled-components';

const RichTextEditorWrapper = styled.div`
  position: relative;
  background: #fff;
  overflow-y: hidden;
  margin: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  .cm-editor.cm-focused {
    outline: none;
  }
`;

export { RichTextEditorWrapper };
