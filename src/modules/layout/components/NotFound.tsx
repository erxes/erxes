import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { AuthContent } from '../styles';

const Layout = styled.main`
  height: 100%;
  flex: 1;
  max-width: 100%;
`;

const NotFoundWrapper = styled.div`
  margin: 40px 0;
  text-align: center;

  img {
    width: 500px;
    margin-bottom: 40px;
    max-width: 100%;
    padding: 0 10px;
  }

  h1 {
    font-weight: bold;
    font-size: 32px;
    margin-bottom: 30px;
    margin-top: 0;
  }

  p {
    font-size: 15px;
    line-height: 1.8em;
    margin-bottom: 30px;
  }

  a {
    font-size: 11px;
  }
`;

function NotFound() {
  return (
    <Layout>
      <AuthContent>
        <NotFoundWrapper>
          <img src="/images/actions/404.svg" alt="404" />
          <h1>{__('This page is not found.')}</h1>
          <p>
            {__("I can't seem to find the page you're looking for.")}
            <br />
            {__("Looks like this page doesn't exist.")}
          </p>
          <Button btnStyle="success" href="http://erxes.io/">
            {__('Go to home page')}
          </Button>
        </NotFoundWrapper>
      </AuthContent>
    </Layout>
  );
}

export default NotFound;
