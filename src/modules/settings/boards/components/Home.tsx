import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Boards, Pipelines } from '../containers';

type Props = {
  boardId: string;
  type: string;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId, type } = this.props;

    const submenu = [
      { title: __('Deal'), link: '/settings/boards/deal' },
      { title: __('Ticket'), link: '/settings/boards/ticket' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Board')} submenu={submenu} />}
        leftSidebar={<Boards type={type} currentBoardId={boardId} />}
        content={<Pipelines type={type} boardId={boardId} />}
      />
    );
  }
}

export default Home;
