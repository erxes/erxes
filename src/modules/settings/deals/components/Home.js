import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Boards, Pipelines } from '../containers';

const propTypes = {
  boardId: PropTypes.string
};

class Home extends Component {
  render() {
    const { boardId } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Deal') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Boards />}
        content={<Pipelines boardId={boardId} />}
      />
    );
  }
}

Home.propTypes = propTypes;
Home.contextTypes = {
  __: PropTypes.func
};

export default Home;
