import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Boards, Pipelines } from '../containers';

type Props = {
  boardId: string;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId } = this.props;

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
