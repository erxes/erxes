import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { render } from 'react-dom';
import styled from 'styled-components';
import { ImportIndicator } from '.';
import apolloClient from '../../../../apolloClient';

const IndicatorWrapper = styled.div.attrs({
  id: 'indicator-content'
})`
  position: fixed;
  top: 0;
  height: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 5070;
`;

const close = () => {
  if (document.getElementById('indicator-container')) {
    const container = document.getElementById('indicator-container');

    if (container) {
      document.body.removeChild(container);
    }
  }
};

const createIndicator = (id: string) => {
  if (!document.getElementById('indicator-container')) {
    const popup = document.createElement('div');
    popup.setAttribute('id', 'indicator-container');
    document.body.appendChild(popup);

    render(<IndicatorWrapper />, popup);
  }

  const wrapper = document.getElementById('indicator-content');

  render(
    <ApolloProvider client={apolloClient}>
      <ImportIndicator id={id} close={close} />
    </ApolloProvider>,
    wrapper
  );
};

const load = (id: string) => createIndicator(id);

const importContacts = { load };

export default importContacts;
