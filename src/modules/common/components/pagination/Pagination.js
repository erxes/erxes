import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { router } from 'modules/common/utils';
import { Icon } from 'modules/common/components';
import { PaginationWrapper, PaginationList } from './styles';
import PerPageChooser from './PerPageChooser';

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

// page chooser component
class Page extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  goto(page) {
    router.setParams(this.props.history, { page });
  }

  onClick(e) {
    e.preventDefault();

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
          <a href="">{page}</a>
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
        <PaginationList>
          <li className={prevClass}>
            <a href="" onClick={this.onPrev}>
              <Icon erxes icon="leftarrow" />
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

          <li className={nextClass}>
            <a href="" onClick={this.onNext}>
              <Icon erxes icon="rightarrow" />
            </a>
          </li>

          {this.renderPerPageChooser()}
        </PaginationList>
      );
    }
  }

  renderPerPageChooser() {
    return <PerPageChooser history={this.props.history} />;
  }

  render() {
    return <PaginationWrapper>{this.renderBar()}</PaginationWrapper>;
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
  const perPage = Number(router.getParam(history, 'perPage')) || 20;

  let totalPagesCount = parseInt(count / perPage, 10) + 1;

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
