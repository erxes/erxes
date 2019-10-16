import { IOptions } from 'modules/boards/types';
import routerUtils from 'modules/common/utils/router';
import { IDeal } from 'modules/deals/types';
import { ITask } from 'modules/tasks/types';
import { ITicket } from 'modules/tickets/types';
import queryString from 'query-string';
import React from 'react';
import history from '../../../../browserHistory';

type Props = {
  stageId: string;
  item: IDeal | ITask | ITicket;
  beforePopupClose: () => void;
  onClick: () => void;
  options: IOptions;
};

class Item extends React.PureComponent<Props, { isFormVisible: boolean }> {
  unlisten?: () => void;

  constructor(props) {
    super(props);

    const { item } = props;

    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    let isFormVisible = false;

    if (itemIdQueryParam === item._id) {
      isFormVisible = true;
    }

    this.state = {
      isFormVisible
    };
  }

  componentDidMount() {
    this.unlisten = history.listen(location => {
      const queryParams = queryString.parse(location.search);

      if (queryParams.itemId === this.props.item._id) {
        return this.setState({ isFormVisible: true });
      }
    });
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  beforePopupClose = () => {
    const { beforePopupClose } = this.props;

    this.setState({ isFormVisible: false }, () => {
      const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

      if (itemIdQueryParam) {
        routerUtils.removeParams(history, 'itemId');
      }

      beforePopupClose();
    });
  };

  render() {
    const { options } = this.props;

    const ItemComponent = options.Item;

    return (
      <ItemComponent
        {...this.props}
        beforePopupClose={this.beforePopupClose}
        isFormVisible={this.state.isFormVisible}
      />
    );
  }
}

export default Item;
