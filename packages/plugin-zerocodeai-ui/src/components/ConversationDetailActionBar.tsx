import React from 'react';
import styled from 'styled-components';
import { __ } from 'coreui/utils';

export const ContentBox = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

type Props = {
  analysis: string;
};

class ConversationDetailActionBar extends React.Component<Props> {
  render() {
    return <span>{this.props.analysis}</span>;
  }
}

export default ConversationDetailActionBar;
