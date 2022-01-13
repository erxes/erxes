import styled from 'styled-components';

export const CategoryContainer = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

export const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;
