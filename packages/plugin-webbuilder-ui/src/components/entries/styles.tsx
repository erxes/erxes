import styled from "styled-components";

export const EntryContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const EntryContent = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  height: 100%;

  table td {
    max-width: 400px;
    overflow: hidden;
  }
`;
