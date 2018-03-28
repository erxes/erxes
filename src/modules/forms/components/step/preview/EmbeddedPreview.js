import React from 'react';
import PropTypes from 'prop-types';
import CommonPreview from './CommonPreview';
import { Embedded, CenterContainer } from '../style';

const propTypes = {
  preview: PropTypes.string
};

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

class EmbeddedPreview extends CommonPreview {
  render() {
    const { preview } = this.props;

    return (
      <Container data={preview}>
        <Embedded>{this.renderContent()}</Embedded>
      </Container>
    );
  }
}

EmbeddedPreview.propTypes = propTypes;

export default EmbeddedPreview;
