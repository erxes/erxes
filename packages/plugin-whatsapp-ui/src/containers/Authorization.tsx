import Spinner from "@erxes/ui/src/components/Spinner";
import React from "react";
import styled from "styled-components";
import { __ } from "@erxes/ui/src/utils/core";

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #edf1f5;
  z-index: 100;
`;

type Props = {
  queryParams: any;
};

export const Authorization = (props: Props) => {
  const { queryParams } = props;
  if (queryParams.whatsAppAuthorized) {
    if (window.opener) {
      window.opener.location.reload();
    }
    window.close();
  }
  return (
    <Wrapper>
      {queryParams.whatsAppAuthorized ? (
        <p>{__("Whats App authorized, You can close this window")}</p>
      ) : (
        <Spinner />
      )}
    </Wrapper>
  );
};
