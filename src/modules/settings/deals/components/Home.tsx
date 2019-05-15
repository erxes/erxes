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
      { title: __('Deal'), link: '/settings/deals/' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={__('Deal')} breadcrumb={breadcrumb} />}
        leftSidebar={<Boards currentBoardId={boardId} />}
        content={<Pipelines boardId={boardId} />}
      />
    );
  }
}

export default Home;
