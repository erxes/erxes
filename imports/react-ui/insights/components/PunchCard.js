import React from 'react';
import Sidebar from './Sidebar';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {};

class PunchCard extends React.Component {
  render() {
    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Punch card' }]} />}
          leftSidebar={<Sidebar />}
          content={' '}
        />
      </div>
    );
  }
}

PunchCard.propTypes = propTypes;

export default PunchCard;
