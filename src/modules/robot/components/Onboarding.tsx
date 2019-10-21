import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import RTG from 'react-transition-group';
import FeatureDetail from '../containers/FeatureDetail';
import { IFeature } from '../types';
import { getCurrentUserName } from '../utils';
import ModulItem from './ModulItem';
import { Content, Greeting, NavButton, SeeAll } from './styles';
import Suggestion from './Suggestion';

type Props = {
  availableFeatures: IFeature[];
  currentStep?: string;
  changeStep: (step: string) => void;
  changeRoute: (route: string) => void;
  forceComplete: () => void;
  currentUser: IUser;
  show: boolean;
};

type State = {
  selectedFeature?: IFeature;
  featureLimit: number;
};

class Onboarding extends React.Component<Props, State> {
  private limit = 9;

  constructor(props) {
    super(props);

    this.state = { selectedFeature: undefined, featureLimit: this.limit };
  }

  renderFeature(feature: IFeature) {
    const { changeStep } = this.props;
    const { text, isComplete, description, icon, color } = feature;

    const onClick = () => {
      this.setState({ selectedFeature: feature }, () => {
        changeStep('featureDetail');
      });
    };

    return (
      <ModulItem
        title={text}
        description={description}
        icon={icon}
        color={color}
        key={feature.name}
        vertical={true}
        onClick={onClick}
        isComplete={isComplete}
      />
    );
  }

  renderContent() {
    const { selectedFeature } = this.state;
    const {
      availableFeatures,
      currentStep,
      changeStep,
      currentUser,
      forceComplete
    } = this.props;

    const commonProps = {
      forceComplete,
      currentUserName: getCurrentUserName(currentUser)
    };

    if (currentStep === 'initial') {
      const onClick = () => {
        changeStep('featureList');
      };

      return (
        <Suggestion {...commonProps} buttonText="Start" onClick={onClick} />
      );
    }

    if (currentStep === 'inComplete') {
      const onClick = () => {
        changeStep('featureList');
      };

      return (
        <Suggestion {...commonProps} buttonText="Resume" onClick={onClick} />
      );
    }

    if (currentStep === 'featureDetail') {
      const onBack = () => {
        this.setState({ selectedFeature: undefined }, () => {
          changeStep('featureList');
        });
      };

      return (
        <>
          <NavButton onClick={onBack}>
            <Icon icon="arrow-left" size={24} />
          </NavButton>
          {selectedFeature && <FeatureDetail feature={selectedFeature} />}
        </>
      );
    }

    if (currentStep === 'featureList') {
      return (
        <>
          <Greeting>
            Hello!{' '}
            <b>
              {getCurrentUserName(currentUser)}
              <span role="img" aria-label="Wave">
                👋
              </span>
            </b>
            <br /> Which feature do you want to set up
          </Greeting>
          {availableFeatures
            .filter((feature, index) => index < this.state.featureLimit)
            .map(availabeFeature => this.renderFeature(availabeFeature))}

          <SeeAll onClick={this.toggleFeatures}>
            {this.isCollapsed()
              ? __('Explore more features')
              : __('Hide some features')}
            <Icon icon="angle-double-right" />
          </SeeAll>
        </>
      );
    }

    return null;
  }

  onHide = () => {
    this.props.changeRoute('');
  };

  isCollapsed = () => {
    return this.state.featureLimit === this.limit;
  };

  toggleFeatures = () => {
    const all = this.props.availableFeatures.length;

    this.setState({ featureLimit: this.isCollapsed() ? all : this.limit });
  };

  showOnboard = () => {
    const { show, currentStep } = this.props;

    return !currentStep ? false : show;
  };

  render() {
    return (
      <RTG.CSSTransition
        in={this.showOnboard()}
        appear={true}
        timeout={600}
        classNames="slide-in-small"
        unmountOnExit={true}
      >
        <Content>
          <NavButton onClick={this.onHide} right={true}>
            <Icon icon="times" size={17} />
          </NavButton>
          {this.renderContent()}
        </Content>
      </RTG.CSSTransition>
    );
  }
}

export default Onboarding;
