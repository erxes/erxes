import React from "react";
import styled from "styled-components";
import Icon from "../modules/common/Icon";

const ErrorContainer = styled.div`
  position: relative;
  height: 100vh;
`;

const Text = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  p {
    border-bottom: 1px solid #000;
    padding-bottom: 10px;
    margin: 0;
  }
`;

function Error({ statusCode }) {
  return (
    <ErrorContainer>
      <Text>
        <p>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : "An error occurred on client"}
        </p>

        <br />

        <a href="/">
          <Icon icon="arrow-left" /> Home
        </a>
      </Text>
    </ErrorContainer>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
