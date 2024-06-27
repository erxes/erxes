import styled from 'styled-components';

const EditorToolbarWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.325rem;
  border-bottom: 0.0625rem solid #e9ecef;
  overflow: visible !important;

  .Select-control {
    width: 56px;
  }
`;

export { EditorToolbarWrapper };
