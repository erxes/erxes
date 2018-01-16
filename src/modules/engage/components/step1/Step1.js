import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ButtonBox = styled.div`
  cursor: pointer;
  text-align: center;
  margin: 20px;
  padding: 20px;
  border-radius: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 300px;

  span {
    margin-bottom: 5px;
    font-weight: bold;
  }

  border: 1px solid
    ${props => (props.selected ? colors.colorSecondary : colors.borderPrimary)};

  p {
    margin: 0;
    color: ${colors.colorCoreLightGray};
    font-size: 12px;
  }

  &:hover {
    ${props => {
      if (!props.selected) {
        return `
          border: 1px dotted ${colors.colorSecondary};
        `;
      }
    }};
  }
`;

const propTypes = {
  changeMethod: PropTypes.func,
  method: PropTypes.string
};

class Step1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Content>
        <ButtonBox
          selected={this.props.method === 'email'}
          onClick={() => this.props.changeMethod('email')}
        >
          <span>Email</span>
          <p>
            Delivered to a user s email inbox <br />Customize with your own
            templates
          </p>
        </ButtonBox>
        <ButtonBox
          selected={this.props.method === 'messenger'}
          onClick={() => this.props.changeMethod('messenger')}
        >
          <span>Messenger</span>
          <p>
            Delivered inside your app<br />Reach active users
          </p>
        </ButtonBox>
      </Content>
    );
  }
}

Step1.propTypes = propTypes;

export default Step1;
