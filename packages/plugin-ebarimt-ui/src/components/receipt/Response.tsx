import React from "react";
import Body from "./Body";
import Footer from "./Footer";
import { ReceiptWrapper } from "./styles";
import { __ } from '@erxes/ui/src/utils/core';
import Header from './Header';

export default (response, _error?) => {
  if (!response) {
    return null;
  }

  return (
    <ReceiptWrapper className="printDocument">
      <Header response={response} />
      <Body items={response.stocks} />
      <Footer response={response} />
    </ReceiptWrapper>
  );
}
