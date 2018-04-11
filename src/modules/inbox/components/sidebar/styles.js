import styled from 'styled-components';

const RightItems = styled.div`
  display: flex;
  align-items: center;

  > div {
    margin-right: 10px;
  }

  button {
    padding: 5px 12px;
  }
`;

const LeftItem = styled.div`
  label {
    margin: 0;
  }
`;

const LoaderWrapper = styled.div`
  padding: 20px;
`;

export { RightItems, LeftItem, LoaderWrapper };
