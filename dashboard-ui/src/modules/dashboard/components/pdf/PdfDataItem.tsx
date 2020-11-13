import React from 'react';
import { StyledCardPdf } from '../styles';

const PdfDataItem = ({
  children,
  title,

  bordered
}) => (
  <StyledCardPdf title={title} bordered={bordered}>
    {children}
  </StyledCardPdf>
);

export default PdfDataItem;
