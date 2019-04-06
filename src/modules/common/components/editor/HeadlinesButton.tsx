import {
  HeadlineOneButton,
  HeadlineThreeButton,
  HeadlineTwoButton
} from 'draft-js-buttons';
import * as React from 'react';
import styled from 'styled-components';

const HeadButton = styled.button`
  display: inline-block;
  border: 0;
  height: 36px;
  outline: 0;
`;

type Props = {
  onOverrideContent: (e) => void;
};

class HeadlinesPicker extends React.Component<Props> {
  componentDidMount() {
    setTimeout(() => {
      window.addEventListener('click', this.onWindowClick);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  onWindowClick = () => {
    this.props.onOverrideContent(undefined);
  };

  render() {
    const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];

    return (
      <div>
        {buttons.map((Button, i) => (
          <Button key={i} {...this.props} />
        ))}
      </div>
    );
  }
}

export default class HeadlinesButton extends React.Component<Props> {
  onClick = () => {
    this.props.onOverrideContent(HeadlinesPicker);
  };

  render() {
    return <HeadButton onClick={this.onClick}>H</HeadButton>;
  }
}
