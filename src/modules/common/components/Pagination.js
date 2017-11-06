import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { router } from 'modules/common/utils';

// pages calculation
const generatePages = (pageCount, currentPage) => {
  const w = 4;

  let pages = _.range(1, pageCount + 1);
  let diff;
  let first = pages.slice(0, w);

  const last = pages.slice(-w);

  let currentStart = currentPage - 1 - w;

  if (currentStart < 0) {
    currentStart = 0;
  }

  let currentEnd = currentPage - 1 + w;

  if (currentEnd < 0) {
    currentEnd = 0;
  }

  const current = pages.slice(currentStart, currentEnd);

  pages = [];

  if (_.intersection(first, current).length === 0) {
    pages = pages.concat(first);
    diff = current[0] - _.last(first);

    if (diff === 2) {
      pages.push(current[0] - 1);
    } else if (diff !== 1) {
      pages.push(null);
    }

    pages = pages.concat(current);
  } else {
    pages = _.union(first, current);
  }

  if (_.intersection(current, last).length === 0) {
    diff = last[0] - _.last(pages);

    if (diff === 2) {
      pages.push(last[0] - 1);
    } else if (diff !== 1) {
      pages.push(null);
    }

    pages = pages.concat(last);
  } else {
    diff = _.difference(last, current);
    pages = pages.concat(diff);
  }

  return pages;
};

// per page component
class Page extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  goto(page) {
    router.setParams(this.props.history, { page });
  }

  onClick() {
    this.goto(this.props.page);
  }

  render() {
    const { currentPage, page } = this.props;

    if (page) {
      let className = '';

      if (page === currentPage) {
        className += ' active disabled';
      }

      return (
        <li className={className} onClick={this.onClick}>
          <Link to={`?page=${page}`}>{page}</Link>
        </li>
      );
    }

    return (
      <li className="disabled">
        <span>...</span>
      </li>
    );
  }
}

Page.propTypes = {
  history: PropTypes.object,
  page: PropTypes.number,
  currentPage: PropTypes.number
};

// main pagination component
class Pagination extends React.Component {
  constructor(props) {
    super(props);

    // bind events
    this.onNext = this.onNext.bind(this);
    this.onPrev = this.onPrev.bind(this);
  }

  goto(page) {
    router.setParams(this.props.history, { page });
  }

  onPrev(e) {
    e.preventDefault();

    const page = this.props.currentPage - 1;

    if (page > 0) {
      this.goto(page);
    }
  }

  onNext(e) {
    e.preventDefault();

    const { totalPagesCount, currentPage } = this.props;

    const page = currentPage + 1;

    if (page <= totalPagesCount) {
      this.goto(page);
    }
  }

  renderBar() {
    const {
      history,
      totalPagesCount,
      pages,
      currentPage,
      isPaginated
    } = this.props;

    if (isPaginated) {
      let prevClass = '';
      let nextClass = '';

      if (currentPage <= 1) {
        prevClass = 'disabled';
      }

      if (currentPage >= totalPagesCount) {
        nextClass = 'disabled';
      }

      return (
        <nav>
          <ul className="pagination">
            <li>
              <a href="" className={prevClass} onClick={this.onPrev}>
                <i className="glyphicon glyphicon-chevron-left" />
              </a>
            </li>

            {pages.map((page, index) => (
              <Page
                key={index}
                history={history}
                currentPage={currentPage}
                page={page}
              />
            ))}

            <li>
              <a href="" className={nextClass} onClick={this.onNext}>
                <i className="glyphicon glyphicon-chevron-right" />
              </a>
            </li>
          </ul>
        </nav>
      );
    }
  }

  render() {
    return (
      <div className="pagination-container">
        <div className="pull-right">{this.renderBar()}</div>

        <div className="clearfix" />
      </div>
    );
  }
}

Pagination.propTypes = {
  history: PropTypes.object,
  totalPagesCount: PropTypes.number,
  pages: PropTypes.array,
  currentPage: PropTypes.number,
  isPaginated: PropTypes.bool
};

const PaginationContainer = props => {
  const { history, count = 100 } = props;

  const currentPage = Number(router.getParam(history, 'page')) || 1;
  const perPage = Number(router.getParam(history, 'perPage')) || 2;

  let totalPagesCount = parseInt(count / perPage) + 1;

  if (count % perPage === 0) {
    totalPagesCount -= 1;
  }

  // calculate page numbers
  const pages = generatePages(totalPagesCount, currentPage);

  const childProps = {
    ...props,
    currentPage,
    isPaginated: totalPagesCount > 1,
    totalPagesCount,
    pages
  };

  return <Pagination {...childProps} />;
};

PaginationContainer.propTypes = {
  history: PropTypes.object,
  count: PropTypes.number
};

export default withRouter(PaginationContainer);
