import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Boards, Pipelines } from '../containers';

type Props = {
  boardId: string;
  boardName: string;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId, boardName } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Deal'), link: '/settings/deals/' },
      { title: `${boardName || ''}` }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Boards currentBoardId={boardId} />}
        content={<Pipelines boardId={boardId} />}
      />
    );
  }
}

export default Home;
