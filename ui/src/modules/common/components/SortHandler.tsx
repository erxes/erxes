import { colors } from 'modules/common/styles';
import { IRouterProps } from 'modules/common/types';
import { router } from 'modules/common/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

const SortWrapper = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  cursor: pointer;

  .arrow {
    position: absolute;
    left: -13px;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;

    &.up {
      border-bottom: 5px solid #bbb;
      top: 2px;

      &.active {
        border-bottom-color: ${colors.colorSecondary};
      }
    }

    &.down {
      border-top: 5px solid #bbb;
      top: 9px;

      &.active {
        border-top-color: ${colors.colorSecondary};
      }
    }
  }
`;

interface IProps extends IRouterProps {
  sortField?: string;
  label?: string;
}

type State = {
  sortValue: string | number;
};

class SortHandler extends React.Component<IProps, State> {
  constructor(props) {
    super(props);
    const { history } = props;
    const sortValue = router.getParam(history, 'sortDirection');

    this.state = { sortValue };
  }

  sortHandle(field, direction) {
    const { history } = this.props;

    router.setParams(history, { sortField: field, sortDirection: direction });
  }

  checkSortActive(name, direction) {
    const { history } = this.props;

    if (
      router.getParam(history, 'sortField') === name &&
      router.getParam(history, 'sortDirection') === direction.toString()
    ) {
      return 'active';
    }

    return '';
  }

  onClickSort = () => {
    const { sortField, history } = this.props;
    const { sortValue } = this.state;

    if (!sortValue) {
      this.setState({ sortValue: -1 });

      return this.sortHandle(sortField, -1);
    }

    if (sortValue < 0) {
      this.setState({ sortValue: 1 });

      return this.sortHandle(sortField, 1);
    }

    this.setState({ sortValue: '' });

    return router.removeParams(history, 'sortDirection', 'sortField');
  };

  render() {
    const { sortField, label } = this.props;

    return (
      <SortWrapper onClick={this.onClickSort}>
        <div>
          <span className={`arrow up ${this.checkSortActive(sortField, -1)}`} />
          <span
            className={`arrow down ${this.checkSortActive(sortField, 1)}`}
          />
        </div>
        {label}
      </SortWrapper>
    );
  }
}

export default withRouter<IProps>(SortHandler);
