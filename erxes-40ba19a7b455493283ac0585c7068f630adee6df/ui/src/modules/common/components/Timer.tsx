import Box from 'modules/common/components/Box';
import React from 'react';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { Alert } from '../utils';
import Button from './Button';
import Tip from './Tip';

const Container = styledTS<{ isComplete: boolean }>(styled.div)`
  padding: 15px 20px 20px 20px;
  color: #243B53;

  ${props =>
    props.isComplete &&
    css`
      background-color: #e3f9e5;
      background-image: linear-gradient(
        to bottom right,
        rgba(0, 0, 0, 0.03) 25%,
        transparent 0,
        transparent 50%,
        rgba(0, 0, 0, 0.03) 0,
        rgba(0, 0, 0, 0.03) 75%,
        transparent 0,
        transparent
      );
    `};
  

  button {
    width: 39px;
    height: 39px;
    padding: 8px 12px;
    font-size: 15px;
  }
`;

const TimeWrapper = styled.div`
  margin-bottom: 15px;

  label span {
    opacity: 0.6;
    text-transform: capitalize;
  }
`;

const Time = styled.h4`
  margin-bottom: 0;
  font-size: 28px;

  span {
    font-size: 14px;
    opacity: 0.6;
  }
`;

export const STATUS_TYPES = {
  COMPLETED: 'completed',
  STOPPED: 'stopped',
  STARTED: 'started',
  PAUSED: 'paused'
};

function formatNumber(n: number) {
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
}

function getSpentTime(seconds: number): React.ReactNode {
  const days = Math.floor(seconds / (3600 * 24));

  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);

  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);

  seconds -= minutes * 60;

  return (
    <Time>
      {days !== 0 && (
        <>
          {formatNumber(days)} <span>d</span>
        </>
      )}
      {formatNumber(hours)}
      <span>h</span>
      {formatNumber(minutes)}
      <span>m</span>
      {formatNumber(seconds)}
      <span>s</span>
    </Time>
  );
}

type Props = {
  taskId: string;
  status: string;
  timeSpent: number;
  startDate?: string;
  update: (
    {
      _id,
      status,
      timeSpent,
      startDate
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
};

type State = {
  status: string;
  timeSpent: number;
};

class TaskTimer extends React.Component<Props, State> {
  timer: NodeJS.Timeout;

  constructor(props) {
    super(props);

    this.timer = {} as NodeJS.Timeout;

    const { status, startDate, timeSpent } = props;

    const absentTime =
      status === STATUS_TYPES.STARTED &&
      startDate &&
      Math.floor((new Date().getTime() - new Date(startDate).getTime()) / 1000);

    this.state = {
      status,
      timeSpent: absentTime ? timeSpent + absentTime : timeSpent
    };
  }

  componentDidMount() {
    const { status } = this.props;

    if (status === STATUS_TYPES.STARTED) {
      this.startTimer();
    }
  }

  onSubmit = () => {
    const { taskId, update } = this.props;
    const { status, timeSpent } = this.state;

    const doc: any = {
      _id: taskId,
      status,
      timeSpent
    };

    if (status === STATUS_TYPES.STARTED && timeSpent === 0) {
      doc.startDate = new Date();
    }

    return update(doc);
  };

  onChangeStatus = (status: string, callback) => {
    this.setState({ status }, callback);
  };

  handleReset = () => {
    Alert.info('Task reset!');

    this.stopTimer();

    return this.setState({ status: STATUS_TYPES.STOPPED, timeSpent: 0 }, () => {
      return this.onSubmit();
    });
  };

  startTimer() {
    this.timer = setInterval(() => {
      this.setState(prevState => ({
        timeSpent: prevState.timeSpent + 1
      }));
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  renderButton() {
    const { status } = this.state;

    const isComplete = status === STATUS_TYPES.COMPLETED;

    const handleComplete = () => {
      Alert.info('Task completed!');

      this.stopTimer();

      return this.onChangeStatus(STATUS_TYPES.COMPLETED, () => {
        return this.onSubmit();
      });
    };

    return (
      <Tip text={isComplete ? 'Completed' : 'Complete'} placement="top">
        <Button
          disabled={isComplete}
          btnStyle={isComplete ? 'success' : 'default'}
          onClick={handleComplete}
          icon="check-1"
        />
      </Tip>
    );
  }

  renderActions() {
    const { status } = this.state;

    const isComplete = status === STATUS_TYPES.COMPLETED;

    const handleClick = () => {
      if ([STATUS_TYPES.STOPPED, STATUS_TYPES.PAUSED].includes(status)) {
        this.startTimer();

        return this.onChangeStatus(STATUS_TYPES.STARTED, () => {
          return this.onSubmit();
        });
      }

      this.stopTimer();

      return this.onChangeStatus(STATUS_TYPES.PAUSED, () => {
        return this.onSubmit();
      });
    };

    return (
      <>
        {[
          STATUS_TYPES.COMPLETED,
          STATUS_TYPES.PAUSED,
          STATUS_TYPES.STOPPED
        ].includes(status) ? (
          <Tip text="Start" placement="top">
            <Button
              disabled={isComplete}
              icon="play-1"
              btnStyle="primary"
              onClick={handleClick}
            />
          </Tip>
        ) : (
          <Tip text="Pause" placement="top">
            <Button btnStyle="danger" icon="pause-1" onClick={handleClick} />
          </Tip>
        )}

        <Tip text="Reset" placement="top">
          <Button btnStyle="warning" icon="redo" onClick={this.handleReset} />
        </Tip>
        {this.renderButton()}
      </>
    );
  }

  renderTime() {
    const { timeSpent, status } = this.state;

    return (
      <TimeWrapper>
        <label>
          Time spent on this task <span>({status})</span>
        </label>
        {getSpentTime(timeSpent)}
      </TimeWrapper>
    );
  }

  render() {
    const { status } = this.state;
    const isComplete = status === STATUS_TYPES.COMPLETED;

    return (
      <Box title="Time tracking" isOpen={true} name="showCustomers">
        <Container isComplete={isComplete}>
          {this.renderTime()}
          {this.renderActions()}
        </Container>
      </Box>
    );
  }
}

export default TaskTimer;
