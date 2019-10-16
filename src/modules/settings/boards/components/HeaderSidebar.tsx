import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { HelperButtons } from 'modules/layout/styles';
import React from 'react';
import { IOption } from '../types';
import BoardForm from './BoardForm';

type Props = {
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  options?: IOption;
};

class HeaderSidebar extends React.Component<Props, {}> {
  renderBoardForm(props) {
    return <BoardForm {...props} />;
  }

  render() {
    const { renderButton, type, options } = this.props;
    const { Header } = Sidebar;

    const boardName = options ? options.boardName : 'Board';

    const addBoard = (
      <HelperButtons>
        <button>
          <Icon icon="add" />
        </button>
      </HelperButtons>
    );

    const content = props => {
      return this.renderBoardForm({ ...props, renderButton, type });
    };

    return (
      <Header uppercase={true}>
        {__(boardName)}

        <ModalTrigger
          title={`New ${boardName}`}
          autoOpenKey="showBoardModal"
          trigger={addBoard}
          content={content}
        />
      </Header>
    );
  }
}

export default HeaderSidebar;
