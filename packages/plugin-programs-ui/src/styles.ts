import styled from "styled-components";

const CarsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export { CarsTableWrapper };
