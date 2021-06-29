import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import { NavButton } from './styles';

const Wrapper = styled.div`
  width: 280px;
  display: flex;
  margin: 0;

  > span {
    margin-right: 10px;
  }

  h3 {
    margin: 4px 30px 10px 0;
    font-size: 16px;
  }

  p {
    margin-bottom: 16px;
  }
`;

type Props = {
  onResumeClick: () => void;
  currentUserName: string;
  forceComplete: () => void;
  toggleContent: (isShow: boolean) => void;
};

export default function Suggestion({
  onResumeClick,
  currentUserName,
  forceComplete,
  toggleContent
}: Props) {
  const onHide = () => {
    toggleContent(false);
  };

  return (
    <>
      <NavButton onClick={onHide} right={true}>
        <Icon icon="times" size={17} />
      </NavButton>
      <Wrapper>
        <span role="img" aria-label="Wave">
          👋
        </span>
        <div>
          <h3>
            Hello, <b>{currentUserName}</b>
          </h3>
          <p>
            {__("You haven't fully configured. Would you like to configure")}
          </p>

          <Button btnStyle="success" size="small" onClick={onResumeClick}>
            Resume
          </Button>
          <Button btnStyle="link" size="small" onClick={forceComplete}>
            Never see again
          </Button>
        </div>
      </Wrapper>
    </>
  );
}
