import { __ } from '../../utils';
import { NotFoundWrapper } from '../styles';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';

function NotFound() {
  return (
    <NotFoundWrapper>
      <div className="auth-content">
        <div className="container">
          <div className="col-md-7">
            <div className="auth-description not-found">
              <img src="/images/not-found.png" alt="erxes" />
              <h1>{__('Page not found')}</h1>
              <p>
                {__('Sorry but the page you are looking for cannot be found')}
              </p>
              <Button href="/welcome">
                <Icon icon="arrow-left" /> {__('Back to home')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </NotFoundWrapper>
  );
}

export default NotFound;
