import ProgressBar from 'modules/common/components/ProgressBar';
import colors from 'modules/common/styles/colors';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IFeature } from '../types';
import { calculatePercentage } from '../utils';
import { Title } from './styles';
import VideoPopup from './VideoPopup';

const Checklist = styled.ul`
  padding: 0;
  list-style: none;
  margin: 0;
`;

const ChecklistItem = styledTS<{ isComplete?: boolean }>(styled.li)`
	position: relative;
	padding-left: 30px;
	margin-bottom: 10px;

	&:before {
		content: '\\ea3f';
		font-style: normal;
    font-family: 'erxes';
		width: 20px;
		height: 20px;
		border-radius: 10px;
		border: 1px solid;
		border-color: ${props =>
      props.isComplete ? colors.colorCoreGreen : colors.colorCoreGray};
		background: ${props => props.isComplete && colors.colorCoreGreen};
		display: block;
		position: absolute;
		left: 0;
		text-align: center;
		color: ${colors.colorWhite};
  }
  
  > span {
    margin-left: 5px;
  }

	a {
    text-decoration: ${props => props.isComplete && 'line-through'};
	  font-style: ${props => props.isComplete && 'italic'};
		color: ${props =>
      props.isComplete ? colors.colorCoreGray : colors.textPrimary};

      &:hover {
        text-decoration: underline;
      }
	}
`;

const Progress = styled.div`
  display: flex;
  margin: 20px 0 10px;
  align-items: center;

  span {
    margin-left: 10px;
  }
`;

type Props = {
  roleOption: IFeature;
  completeShowStep: () => void;
  stepsCompleteness: { [key: string]: boolean };
};

class SetupDetail extends React.Component<Props> {
  renderProgress = () => {
    const { stepsCompleteness } = this.props;

    let total = 0;
    let done = 0;

    for (const key in stepsCompleteness) {
      if (stepsCompleteness.hasOwnProperty(key)) {
        total++;

        if (stepsCompleteness[key]) {
          done++;
        }
      }
    }

    const percent = calculatePercentage(total, done);

    return (
      <Progress>
        <ProgressBar
          percentage={percent}
          color={colors.colorCoreBlue}
          height="10px"
        />
        <span>{percent}%</span>
      </Progress>
    );
  };

  renderSettings() {
    const { roleOption } = this.props;
    return (
      <Checklist>
        {Object.entries(roleOption.settingsDetails).map((steps, index) => {
          const detail = steps[1];
          return (
            <ChecklistItem key={index}>
              <Link to={`${detail.url}#signedIn=true`}>{detail.name}</Link>
            </ChecklistItem>
          );
        })}
      </Checklist>
    );
  }

  renderVideo() {
    const { roleOption } = this.props;

    if (roleOption.videoUrl && roleOption.videoUrl !== 'url') {
      return (
        <VideoPopup
          onVideoClick={this.props.completeShowStep}
          name={roleOption.name}
          videoUrl={roleOption.videoUrl}
          thumbImage={roleOption.videoThumb}
        />
      );
    }

    return;
  }

  render() {
    const { roleOption } = this.props;
    return (
      <>
        <Title>{roleOption.text}</Title>
        {this.renderVideo()}
        <p>{roleOption.description}</p>
        {this.renderProgress()}
        {this.renderSettings()}
      </>
    );
  }
}

export default SetupDetail;
