import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar';
import Filter from './Filter';

const propTypes = {
  data: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
};

class FirstResponse extends React.Component {
  render() {
    const { brands } = this.props;

    const content = (
      <div className="insight-wrapper">
        <Filter brands={brands} />
        First Response Report
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'First Response Report' }]} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

FirstResponse.propTypes = propTypes;

export default FirstResponse;
