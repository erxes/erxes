import { IItem, IOptions } from 'modules/boards/types';
import { IRouterProps } from 'modules/common/types';
import routerUtils from 'modules/common/utils/router';
import { IDeal } from 'modules/deals/types';
import { ITicket } from 'modules/tickets/types';
import queryString from 'query-string';
import React from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  stageId?: string;
  item: IDeal | IItem | ITicket;
  beforePopupClose?: () => void;
  onClick?: () => void;
  options: IOptions;
  itemRowComponent?: any;
  groupType?: string;
  groupObj?: any;
} & IRouterProps;

class Item extends React.PureComponent<Props, { isFormVisible: boolean }> {
  unlisten?: () => void;

  constructor(props) {
    super(props);

    const { item, history, groupObj } = props;

    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    let isFormVisible = false;

    if (itemIdQueryParam === `${item._id}${groupObj ? groupObj._id : ''}`) {
      isFormVisible = true;
    }

    this.state = {
      isFormVisible
    };
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(location => {
      const queryParams = queryString.parse(location.search);

      const { item, groupObj } = this.props;

      if (queryParams.itemId === `${item._id}${groupObj ? groupObj._id : ''}`) {
        return this.setState({ isFormVisible: true });
      }
    });
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  beforePopupClose = (afterPopupClose?: () => void) => {
    const { beforePopupClose, history } = this.props;

    this.setState({ isFormVisible: false }, () => {
      const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

      if (itemIdQueryParam) {
        routerUtils.removeParams(history, 'itemId');
      }

      if (beforePopupClose) {
        beforePopupClose();
      }

      if (afterPopupClose) {
        afterPopupClose();
      }
    });
  };

  render() {
    const { options, itemRowComponent } = this.props;

    const ItemComponent = itemRowComponent || options.Item;

    return (
      <ItemComponent
        {...this.props}
        beforePopupClose={this.beforePopupClose}
        isFormVisible={this.state.isFormVisible}
      />
    );
  }
}

export default withRouter<Props>(Item);
