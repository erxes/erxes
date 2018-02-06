import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep
} from './Style';
import { Button } from 'modules/common/components';

const propTypes = {
  brands: PropTypes.array,
  users: PropTypes.array,
  save: PropTypes.func,
  kind: PropTypes.string
};

class Step extends Component {
  showStep(step) {
    this.setState({ step });
  }

  save(e) {
    const doc = this.generateDoc(e);
    this.props.save(doc);
  }

  saveLive(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: true, isDraft: false, ...doc });
  }

  saveDraft(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: false, isDraft: true, ...doc });
  }

  renderTitle() {
    const { kind } = this.props;
    let title = 'Visitor auto message';
    if (kind === 'auto') {
      title = 'Auto message';
    } else if (kind === 'manual') {
      title = 'Manual message';
    }
    const breadcrumb = [{ title: 'Engage', link: '/engage' }, { title: title }];
    return breadcrumb;
  }

  renderStep(step, title, hasNext, content) {
    let next = (
      <Button.Group>
        <Button
          btnStyle="warning"
          size="small"
          icon="plus"
          onClick={e => this.saveDraft(e)}
        >
          Save & Draft
        </Button>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus"
          onClick={e => this.saveLive(e)}
        >
          Save & Live
        </Button>
      </Button.Group>
    );

    if (hasNext) {
      next = (
        <Button
          btnStyle="default"
          size="small"
          icon="ios-arrow-forward"
          onClick={() => this.showStep(step + 1)}
        >
          Next
        </Button>
      );
    }

    let show = false;

    if (this.state.step === step) {
      show = true;
    }

    return (
      <StepItem show={show}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepImg>
                <img src="/images/icons/erxes-08.svg" alt="Email" />
              </StepImg>
              <StepHeaderTitle>{title}</StepHeaderTitle>
            </StepHeader>
            {next}
          </StepHeaderContainer>
          <StepContent>{content}</StepContent>
        </FullStep>
        <ShortStep show={!show} onClick={() => this.showStep(step)}>
          <StepImg>
            <img src="/images/icons/erxes-08.svg" alt="Email" />
          </StepImg>
        </ShortStep>
      </StepItem>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
