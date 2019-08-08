import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Boards from '../containers/Boards';
import Pipelines from '../containers/Pipelines';

type Props = {
  boardId: string;
  type: string;
  title: string;
  options?: any;
};

class Home extends React.Component<Props, {}> {
  render() {
    const { boardId, type, title, options = {} } = this.props;

    // tslint:disable
    console.log('options: ', options);

    const boardName = options.boardName || 'Board';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __(title), link: `/settings/boards/${type}` }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__(boardName)} breadcrumb={breadcrumb} />
        }
        leftSidebar={
          <Boards options={options} type={type} currentBoardId={boardId} />
        }
        content={<Pipelines options={options} type={type} boardId={boardId} />}
      />
    );
  }
}

export default Home;
