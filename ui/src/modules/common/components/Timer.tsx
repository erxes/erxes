import dayjs from 'dayjs';
import Box from 'modules/common/components/Box';
import * as React from 'react';
import styled from 'styled-components';
import { Alert } from '../utils';
import Button from './Button';
import { ControlLabel } from './form';

const Container = styled.div`
  align-items: center;
  padding: 10px;
`;

const Time = styled.div`
  padding: 10px;
  justify-content: center;
  margin-bottom: 10px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

function getTime(date) {
  const now = dayjs(date).toNow();

  return now;
}

function buttonSuccess(handleClick) {
  return (
    <Button btnStyle="success" size="large" icon="play" onClick={handleClick}>
      Play
    </Button>
  );
}

function buttonPause(handleClick) {
  return (
    <Button btnStyle="danger" size="large" icon="pause-1" onClick={handleClick}>
      Pause
    </Button>
  );
}

function Timer(props) {
  const [status, setStatus] = React.useState('pause');

  function renderActions() {
    const handleClick = () => {
      setStatus(['stop', 'pause'].includes(status) ? 'play' : 'pause');
    };

    const handleReset = () => Alert.info('Task reset!');

    return (
      <ButtonWrapper>
        {status === 'pause'
          ? buttonSuccess(handleClick)
          : buttonPause(handleClick)}
        <Button
          btnStyle="warning"
          icon="checked-1"
          size="large"
          onClick={handleReset}
        >
          Reset
        </Button>
      </ButtonWrapper>
    );
  }

  function renderTime() {
    const time = getTime('2020-08-25T06:30:49.293Z');

    return (
      <Time>
        <ControlLabel>Time spent: {time}</ControlLabel>
      </Time>
    );
  }

  function renderButton() {
    const handleComplete = () => {
      Alert.info('Task completed!');
    };

    return (
      <Button
        block={true}
        btnStyle="simple"
        onClick={handleComplete}
        size="small"
      >
        Complete
      </Button>
    );
  }

  return (
    <Box title="Time tracking" isOpen={true} name="showCustomers">
      <Container>
        {renderTime()}
        {renderActions()}
        {renderButton()}
      </Container>
    </Box>
  );
}

export default Timer;
