import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Spinner from 'react-bootstrap/Spinner';

const Spin = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  height: 100%;
  flex: 1;
`;

function Loader() {
  return (
    <Spin>
      <Spinner animation="border" variant="info" />
    </Spin>
  );
}

export default Loader;
