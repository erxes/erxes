import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { TaggerPopover } from '/imports/react-ui/common';

const propTypes = {};

class PunchCard extends React.Component {
  render() {
    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Punch card' }]} />}
          content={'content'}
        />
      </div>
    );
  }
}

PunchCard.propTypes = propTypes;

export default PunchCard;
