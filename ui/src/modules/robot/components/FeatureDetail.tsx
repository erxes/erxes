import ProgressBar from 'modules/common/components/ProgressBar';
import colors from 'modules/common/styles/colors';
import { roundToTwo } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IFeature } from '../types';
import { Title } from './styles';
import VideoPopup from './VideoPopup';

const Wrapper = styled.div`
  width: 315px;
`;

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
  margin: 30px 0 10px;

  span {
    margin-left: 10px;
  }
`;

type Props = {
  feature: IFeature;
  completeShowStep: () => void;
  stepsCompleteness: { [key: string]: boolean };
};

class FeatureDetail extends React.Component<Props> {
  calculatePercentage = (total: number, done: number) => {
    return roundToTwo((done * 100) / total);
  };

  renderProgress = () => {
    const { feature, stepsCompleteness } = this.props;

    if (!feature.showSettings || feature.settings.length === 0) {
      return null;
    }

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

    const percent = this.calculatePercentage(total, done);

    return (
      <Progress>
        <ProgressBar
          percentage={percent}
          color={colors.colorCoreBlue}
          height="18px"
        />
        <span>{percent}%</span>
      </Progress>
    );
  };

  renderSettings() {
    const { feature, stepsCompleteness } = this.props;

    if (!feature.showSettings) {
      return null;
    }

    return (
      <>
        <Checklist>
          {feature.settings.map((setting, index) => {
            const detail = feature.settingsDetails[setting];

            return (
              <ChecklistItem
                key={index}
                isComplete={stepsCompleteness[setting]}
              >
                <Link to={`${detail.url}#signedIn=true`}>{detail.name}</Link>
                {stepsCompleteness[setting] && (
                  <span role="img" aria-label="Selebration">
                    🎉
                  </span>
                )}
              </ChecklistItem>
            );
          })}
        </Checklist>
      </>
    );
  }

  renderVideo() {
    const { feature } = this.props;

    if (feature.videoUrl && feature.videoUrl !== 'url') {
      return (
        <VideoPopup
          onVideoClick={this.props.completeShowStep}
          name={feature.name}
          videoUrl={feature.videoUrl}
          thumbImage={feature.videoThumb}
        />
      );
    }

    return;
  }

  render() {
    const { feature } = this.props;

    return (
      <Wrapper>
        <Title>{feature.text}</Title>
        {this.renderVideo()}
        <p>{feature.description}</p>
        {this.renderProgress()}
        {this.renderSettings()}
      </Wrapper>
    );
  }
}

export default FeatureDetail;
