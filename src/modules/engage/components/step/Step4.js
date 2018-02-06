import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { MessengerPreview } from '../../containers';
import { Button } from 'modules/common/components';

const Content = styled.div`
  display: flex;
  height: 100%;
`;

const Divider = styled.div`
  width: 1px;
  background: ${colors.borderPrimary};
  height: 100%;
  margin: 0 10px;
`;

const ContentCenter = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  > img {
    max-height: 70%;
    max-width: 70%;
  }
`;

const propTypes = {
  message: PropTypes.string,
  messenger: PropTypes.object,
  fromUser: PropTypes.string,
  save: PropTypes.func
};

class Step4 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromUser: this.props.fromUser || '',
      messenger: {
        brandId: '',
        kind: '',
        sentAs: ''
      }
    };
  }

  componentDidMount() {
    if (this.props.messenger) {
      const messenger = {
        brandId: this.props.messenger.brandId || '',
        kind: '',
        sentAs: this.props.messenger.sentAs || ''
      };
      this.setState({ messenger });
    }
  }

  render() {
    return (
      <Content>
        <ContentCenter>
          <img src="/images/robots/robot-01.svg" alt="Email" />
          <Button.Group>
            <Button
              btnStyle="warning"
              size="small"
              icon="plus"
              onClick={e => this.props.saveDraft(e)}
            >
              Save & Draft
            </Button>
            <Button
              btnStyle="primary"
              size="small"
              icon="plus"
              onClick={e => this.props.saveLive(e)}
            >
              Save & Live
            </Button>
          </Button.Group>
        </ContentCenter>
        <Divider />
        <ContentCenter>
          <MessengerPreview
            sentAs={this.state.messenger.sentAs}
            content={this.props.message}
            fromUser={this.state.fromUser}
          />
        </ContentCenter>
      </Content>
    );
  }
}

Step4.propTypes = propTypes;

export default Step4;
