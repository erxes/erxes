import { __ } from 'erxes-ui/lib/utils/core';
import Icon from 'modules/common/components/Icon';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { Container, NavButton, Title } from '../styles';
import VideoPopup from '../VideoPopup';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  /* queries, */ mutations /* , subscriptions */
} from 'modules/robot/graphql';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import {
  CompleteShowStepMutationResponse
  /* StepsCompletenessQueryResponse, */
} from 'modules/robot/types';
import { IUser } from 'modules/auth/types';
import ProgressBar from 'modules/common/components/ProgressBar';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { calculatePercentage } from 'modules/robot/utils';
import styledTS from 'styled-components-ts';
/* import { Link } from "react-router-dom"; */

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
  changeRoute: (route: string) => void;
  toggleContent: (isShow: boolean) => void;
};

type FinalProps = Props &
  CompleteShowStepMutationResponse & {
    /* stepsCompletenessQuery: StepsCompletenessQueryResponse; */
    currentUser: IUser;
  };

class SetupDetail extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  completeShowStep = () => {
    const { completeShowStepMutation } = this.props;
    completeShowStepMutation({ variables: { step: `${'Missing you'}Show` } });
  };

  withHeader = (content: React.ReactNode) => {
    const { changeRoute, toggleContent } = this.props;

    const onBack = () => {
      changeRoute('setupList');
    };

    const onHide = () => {
      toggleContent(false);
    };

    return (
      <>
        <NavButton onClick={onBack}>
          <Icon icon="arrow-left" size={24} />
        </NavButton>

        <NavButton id="robot-feature-close" onClick={onHide} right={true}>
          <Icon icon="times" size={17} />
        </NavButton>
        {content}
      </>
    );
  };

  renderVideo() {
    return (
      <VideoPopup
        onVideoClick={this.completeShowStep}
        name={'Missing you'}
        videoUrl={'https://www.youtube.com/watch?v=V_bjdh4yDsI'}
        thumbImage={'http://i3.ytimg.com/vi/V_bjdh4yDsI/maxresdefault.jpg'}
      />
    );
  }

  renderProgress = () => {
    const {
      /* feature, */
      /* stepsCompleteness */
    } = this.props;

    /* if (!feature.showSettings || feature.settings.length === 0) {
      return null;
    } */

    const total = 0;
    const done = 0;

    /* for (const key in stepsCompleteness) {
      if (stepsCompleteness.hasOwnProperty(key)) {
        total++;

        if (stepsCompleteness[key]) {
          done++;
        }
      }
    } */

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
    const {
      /* feature, stepsCompleteness */
    } = this.props;

    /* if (!feature.showSettings) {
      return null;
    } */

    return (
      <Checklist>
        <ChecklistItem>check 1</ChecklistItem>
        <ChecklistItem>check 2</ChecklistItem>
        <ChecklistItem>check 3</ChecklistItem>
        <ChecklistItem>check 4</ChecklistItem>
        {/* {feature.settings.map((setting, index) => {
          const detail = feature.settingsDetails[setting];

          return (
            <ChecklistItem key={index} isComplete={stepsCompleteness[setting]}>
              <Link to={`${detail.url}#signedIn=true`}>{detail.name}</Link>
              {stepsCompleteness[setting] && (
                <span role="img" aria-label="Selebration">
                  🎉
                </span>
              )}
            </ChecklistItem>
          );
        })} */}
      </Checklist>
    );
  }

  renderContent() {
    return this.withHeader(
      <>
        <Title>hello world</Title>
        {this.renderVideo()}
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
        </p>
        {this.renderProgress()}
        {this.renderSettings()}
      </>
    );
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default withProps<Props>(
  compose(
    /* graphql<Props>(gql(queries.stepsCompleteness), {
      name: "stepsCompletenessQuery",
      options: ({ feature }) => {
        return {
          variables: {
            steps: feature.settings,
          },
        };
      },
    }), */
    graphql<{}>(gql(mutations.completeShowStep), {
      name: 'completeShowStepMutation'
    })
  )(withCurrentUser(SetupDetail))
);
