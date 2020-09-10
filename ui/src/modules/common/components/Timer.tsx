import Box from 'modules/common/components/Box';
import React from 'react';
import styled from 'styled-components';
import { Alert } from '../utils';
import Button from './Button';
import { ControlLabel } from './form';

const Container = styled.div`
  align-items: center;
  padding: 10px;
`;

const TimeWrapper = styled.div`
  text-align: center;
  padding: 5px;
  justify-content: center;
  margin-bottom: 5px;

  h1 {
    margin: 0;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const Time = styled.h1`
  text-align: center;
`;

export const STATUS_TYPES = {
  COMPLETED: 'completed',
  STOPPED: 'stopped',
  STARTED: 'started',
  PAUSED: 'paused'
};

function getSpentTime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));

  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);

  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);

  seconds -= minutes * 60;

  return `
    ${days}.
    ${hours}.
    ${minutes}.
    ${seconds}
  `;
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
      <Button
        block={true}
        disabled={isComplete}
        btnStyle={isComplete ? 'success' : 'simple'}
        onClick={handleComplete}
        size="small"
      >
        {isComplete ? 'Completed' : 'Complete'}
      </Button>
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
      <ButtonWrapper>
        {[
          STATUS_TYPES.COMPLETED,
          STATUS_TYPES.PAUSED,
          STATUS_TYPES.STOPPED
        ].includes(status) ? (
          <Button
            disabled={isComplete}
            btnStyle="success"
            size="large"
            icon="play-1"
            onClick={handleClick}
          >
            Start
          </Button>
        ) : (
          <Button
            btnStyle="danger"
            size="large"
            icon="pause-1"
            onClick={handleClick}
          >
            Pause
          </Button>
        )}

        <Button
          btnStyle="warning"
          icon="checked-1"
          size="large"
          onClick={this.handleReset}
        >
          Reset
        </Button>
      </ButtonWrapper>
    );
  }

  renderTime() {
    const { timeSpent } = this.state;

    return (
      <TimeWrapper>
        <ControlLabel>Time spent on this task</ControlLabel>
        <Time>{getSpentTime(timeSpent)}</Time>
      </TimeWrapper>
    );
  }

  render() {
    return (
      <Box title="Time tracking" isOpen={true} name="showCustomers">
        <Container>
          {this.renderTime()}
          {this.renderActions()}
          {this.renderButton()}
        </Container>
      </Box>
    );
  }
}

export default TaskTimer;
