import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { uploadHandler } from 'modules/common/utils';
import { ActionBar } from 'modules/layout/components';
import {
  FormControl,
  FormGroup,
  ControlLabel,
  Icon
} from 'modules/common/components';
import { IntroPreview } from './preview';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import { WidgetApperance, SubHeading } from 'modules/settings/styles';

const propTypes = {
  onChange: PropTypes.func
};

class Intro extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <WidgetApperance>
        <LeftItem>hi</LeftItem>
        <Preview>
          <IntroPreview />
        </Preview>
      </WidgetApperance>
    );
  }
}

Intro.propTypes = propTypes;
Intro.contextTypes = {
  __: PropTypes.func
};

export default Intro;
