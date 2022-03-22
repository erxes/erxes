import React from 'react';
import { ContenFooter, ContentBox } from '@erxes/ui/src/layout/styles';
import styledTS from 'styled-components-ts';
import styled from 'styled-components';
import { colors } from '@erxes/ui/src/styles';

type Props = {
  actionBar?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  transparent: boolean;
  center?: boolean;
};

function PageContent({
  children,
  transparent
}: Props) {
  return (
    <ContentBox transparent={transparent}>{children}</ContentBox>
  );
}

export default PageContent;
