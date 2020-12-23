import React from 'react';
import styled from 'styled-components';

const ScheduleContainer = styled.div`
  background-color: #fff;
  height: 100vh;
  width: 100%;

  iframe {
    border: none;
  }
`;

class Schedule extends React.Component<
  { slug: string },
  { iFrameHeight: number }
> {
  constructor(props) {
    super(props);

    this.state = {
      iFrameHeight: 600
    };
  }

  componentDidMount() {
    this.setState({ iFrameHeight: window.document.body.scrollHeight });
  }

  render() {
    const { slug } = this.props;

    return (
      <ScheduleContainer>
        <iframe
          src={`https://schedule.nylas.com/${slug}`}
          width="100%"
          height={this.state.iFrameHeight}
          title="Erxes schedule"
        />
      </ScheduleContainer>
    );
  }
}

export default Schedule;
