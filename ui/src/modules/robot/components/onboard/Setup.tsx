import CollapseContent from 'modules/common/components/CollapseContent';
import { __ } from 'modules/common/utils';
import { ROLE_SETUP } from 'modules/robot/constants';
import { IFeature, IRoleValue } from 'modules/robot/types';
import React from 'react';
import styled from 'styled-components';
import {
  Container,
  Greeting,
  NavButton,
  SetupList,
  SubContent
} from '../styles';
import colors from 'modules/common/styles/colors';
import dimensions from 'modules/common/styles/dimensions';
import { getCurrentUserName } from 'modules/robot/utils';
import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';

const Text = styled.div`
  font-weight: normal;
  background: ${colors.colorWhite};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;

  &:hover {
    cursor: pointer;
  }

  h6 {
    margin: 0px;
    width: 80%;
  }

  p {
    margin: 0px;
    font-size: 11px;
    background-color: #673fbd;
    color: white;
    padding: 2px 5px 2px;
    border-radius: ${dimensions.unitSpacing}px;
  }
`;

type Props = {
  changeRoute: (route: string) => void;
  roleValue: IRoleValue;
  currentRoute?: string;
  currentUser: IUser;
  toggleContent: (isShow: boolean) => void;
};

type State = { selectedFeature?: IFeature };

class Setup extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { selectedFeature: undefined };
  }

  withHeader = (content: React.ReactNode) => {
    const { toggleContent } = this.props;

    const onHide = () => {
      toggleContent(false);
    };

    return (
      <>
        <NavButton id="robot-feature-close" onClick={onHide} right={true}>
          <Icon icon="times" size={17} />
        </NavButton>
        {content}
      </>
    );
  };

  renderSetup() {
    const { changeRoute, roleValue } = this.props;

    const onClick = () => {
      changeRoute('setupDetail');
    };

    return (
      <SetupList>
        {ROLE_SETUP.map(group => (
          <CollapseContent
            key={group.key}
            id={group.key}
            title={__(group.title)}
          >
            {group.content.map((content, index) => {
              if (content.types.includes(roleValue.value)) {
                return (
                  <Text key={index} onClick={onClick}>
                    <h6>{content.name}</h6>
                    <p>{content.steps}</p>
                  </Text>
                );
              }
              return null;
            })}
          </CollapseContent>
        ))}
      </SetupList>
    );
  }

  renderContent() {
    const { currentRoute, currentUser, roleValue } = this.props;
    const text = "Let's set up your workplace for success";

    if (currentRoute === 'setupList') {
      return this.withHeader(
        <>
          <Greeting>
            <b>
              {__('Hello')}! {getCurrentUserName(currentUser)}
              <span role="img" aria-label="Wave">
                👋
              </span>
            </b>
            <p>{__(text)}.</p>
          </Greeting>

          <SubContent>
            <h4>
              {roleValue.label} {__('Setup')}
            </h4>
          </SubContent>

          {this.renderSetup()}
        </>
      );
    }
    return null;
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default Setup;
