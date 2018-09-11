import { Wrapper } from 'modules/layout/components';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Boards, Pipelines } from '../containers';

type Props = {
  boardId: string
};

class Home extends React.Component<Props, {}> {
  static contextTypes =  {
    __: PropTypes.func
  }
  
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

export default Home;
