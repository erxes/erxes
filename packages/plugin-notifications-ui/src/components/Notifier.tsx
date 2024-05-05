import React, { useState } from 'react';
import styled from 'styled-components';
import NotifierItem from './NotiferItem';

const NotifierContainer = styled.div`
  position: fixed;
  bottom: 55px;
  left: 15px;
`;

const Notifier = () => {
  const [show, setShow] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<string>('feature');

  const renderNotifications = () => {
    return (
      <>
        <NotifierItem>
          <span role="img" aria-label="Wave">
            👋
          </span>
          <div>
            <h3>Hello Ganzorig</h3>
            <p>
              Hello I'm erxes. Make sure <a href="#test">save your profile</a>{' '}
              information
            </p>
          </div>
        </NotifierItem>
        <NotifierItem closable={false}>
          <span role="img" aria-label="Wave">
            👋
          </span>
          <div>
            <h3>Hello Ganzorig</h3>
            <p>
              Hello I'm erxes. Make sure <a href="#test">save your profile</a>{' '}
              information
            </p>
          </div>
        </NotifierItem>
      </>
    );
  };

  return <NotifierContainer>{renderNotifications()}</NotifierContainer>;
};

export default Notifier;
