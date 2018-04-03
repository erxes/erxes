import React from 'react';
import CommonPreview from './CommonPreview';
import { Embedded, CenterContainer } from '../style';

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

class EmbeddedPreview extends CommonPreview {
  render() {
    return (
      <Container>
        <Embedded>{this.renderContent()}</Embedded>
      </Container>
    );
  }
}

export default EmbeddedPreview;
