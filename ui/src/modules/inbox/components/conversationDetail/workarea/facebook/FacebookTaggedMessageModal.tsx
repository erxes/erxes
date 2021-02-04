import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import colors from 'modules/common/styles/colors';
import { BoxRoot } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  > a {
    flex-basis: 33%;

    &.other {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      padding: 8px;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  h3 {
    margin: 10px 0 20px;
    font-size: 20px;
    width: 100%;
    align-self: center;
    font-weight: 600;
    text-align: center;
  }
`;

const Box = styled(BoxRoot)`
  min-width: 220px;
  padding: 30px;
  margin: 8px;
  background: ${colors.colorWhite};

  img {
    width: 50px;
  }

  span {
    font-weight: 500;
    font-size: 16px;
    margin-top: 15px;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
  }
`;

type Props = {
  trigger?: React.ReactNode;
};

export const FacebookTaggedMessageModal = ({ trigger }: Props) => {
  const defaultTrigger = (
    <Button block={true} btnStyle="success" uppercase={false}>
      {__('Send Tagged Message')}
    </Button>
  );

  const content = () => {
    return (
      <Wrapper>
        <h3>{__('Which integration would you like to connect?')}</h3>
        <Link to="/settings/integrations/createFacebook?kind=facebook-post">
          <Box>
            <img src="/images/integrations/facebook.png" alt="Facebook Post" />
            <span>{__('Facebook Post')}</span>
            <p>
              {__('Receiving Facebook post and comments in your team inbox')}
            </p>
          </Box>
        </Link>
      </Wrapper>
    );
  };

  return (
    <ModalTrigger
      title="Reply"
      trigger={trigger ? trigger : defaultTrigger}
      content={content}
      size="lg"
      hideHeader={true}
      centered={true}
    />
  );
};
