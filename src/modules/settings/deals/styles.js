import styled from 'styled-components';

const StagesContainer = styled.div`
  > button {
    margin-top: 20px;
  }
`;

const StageItemContainer = styled.div`
  width: 100%;
  input {
    float: left;
    width: 200px;
  }
  button {
    float: right;
  }
`;

export { StagesContainer, StageItemContainer };
