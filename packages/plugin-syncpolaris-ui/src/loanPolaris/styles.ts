import styled from "styled-components";

const ContractsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ScrollTableColls = styled.div`
  overflow-x: scroll;
  overflow-y: hidden;
  width: 100%;
  white-space: nowrap;
`;

export { ContractsTableWrapper, ScrollTableColls };
