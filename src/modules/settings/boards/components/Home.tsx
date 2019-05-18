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
      { title: __('Board'), link: '/settings/boards/' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Board')} breadcrumb={breadcrumb} />}
        leftSidebar={<Boards currentBoardId={boardId} />}
        content={<Pipelines boardId={boardId} />}
      />
    );
  }
}

export default Home;
