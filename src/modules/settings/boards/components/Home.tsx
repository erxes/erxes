import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Boards from '../containers/Boards';
import Pipelines from '../containers/Pipelines';

type Props = {
  boardId: string;
  type: string;
  title: string;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId, type, title } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Board') },
      { title: __(title), link: `/settings/boards/${type}` }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Board')} breadcrumb={breadcrumb} />}
        leftSidebar={<Boards type={type} currentBoardId={boardId} />}
        content={<Pipelines type={type} boardId={boardId} />}
      />
    );
  }
}

export default Home;
