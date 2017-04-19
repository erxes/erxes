import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';

const propTypes = {
  children: PropTypes.node.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class Pagination extends Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };

    this.loadMore = this.loadMore.bind(this);
  }

  loadMore() {
    this.setState({ isOpen: false });
  }

  render() {
    const { children, loadMore, hasMore } = this.props;

    return (
      <div className="paginate-wrapper">
        {children}
        {hasMore
          ? <div className="paginate-button">
              <Button onClick={loadMore}>Load more</Button>
            </div>
          : null}
      </div>
    );
  }
}

Pagination.propTypes = propTypes;

export default Pagination;
