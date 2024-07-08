import { PaginationList, PaginationWrapper } from './styles';
import React from 'react';
import { difference, intersection, range, union } from '../../utils/core';
import { useLocation, useNavigate } from 'react-router-dom';

import Icon from '../Icon';
import PerPageChooser from './PerPageChooser';
import { router } from '../../utils/core';

const generatePages = (pageCount: number, currentPage: number): number[] => {
  const w = 4;

  // Create an array with pageCount numbers, starting from 1
  let pages = range(1, pageCount);

  let diff;
  const first = pages.slice(0, w);

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

  if (intersection(first, current).length === 0) {
    pages = pages.concat(first);
    diff = current[0] - first[first.length - 1];

    if (diff === 2) {
      pages.push(current[0] - 1);
    } else if (diff !== 1) {
      pages.push(-1);
    }

    pages = pages.concat(current);
  } else {
    pages = union(first, current);
  }

  if (intersection(current, last).length === 0) {
    diff = last[0] - pages[pages.length - 1];

    if (diff === 2) {
      pages.push(last[0] - 1);
    } else if (diff !== 1) {
      pages.push(-1);
    }

    pages = pages.concat(last);
  } else {
    diff = difference(last, current);
    pages = pages.concat(diff);
  }

  return pages;
};

const Page = ({ page, currentPage }: { page: number; currentPage: number }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goto = page => {
    router.setParams(navigate, location, { page });
  };

  const onClick = e => {
    e.preventDefault();
    goto(page);
  };

  if (page !== -1) {
    let className = '';

    if (page === currentPage) {
      className += ' active disabled';
    }

    return (
      <li className={className} onClick={onClick}>
        <a href="#page">{page}</a>
      </li>
    );
  }

  return (
    <li className="disabled">
      <span>...</span>
    </li>
  );
};

const Pagination = ({
  totalPagesCount,
  pages = [],
  count,
  currentPage = 1,
  isPaginated,
  hidePerPageChooser
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goto = page => {
    router.setParams(navigate, location, { page });
  };

  const onPrev = e => {
    e.preventDefault();

    const page = (currentPage || 1) - 1;

    if (page > 0) {
      goto(page);
    }
  };

  const onNext = e => {
    e.preventDefault();

    const page = (currentPage || 1) + 1;

    if (page <= totalPagesCount) {
      goto(page);
    }
  };

  const renderBar = () => {
    if (!isPaginated) {
      return null;
    }

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
          <a href="#prev" onClick={onPrev}>
            <Icon icon="arrow-left" />
          </a>
        </li>

        {pages.map((page, index) => (
          <Page key={index} currentPage={currentPage} page={page} />
        ))}

        <li className={nextClass}>
          <a href="#next" onClick={onNext}>
            <Icon icon="arrow-right" />
          </a>
        </li>

        {!hidePerPageChooser && renderPerPageChooser()}
      </PaginationList>
    );
  };

  const renderPerPageChooser = () => {
    return <PerPageChooser count={count || 0} />;
  };

  return <PaginationWrapper>{renderBar()}</PaginationWrapper>;
};

const PaginationContainer = ({
  count = 100,
  hidePerPageChooser,
  ...props
}: {
  count?: number;
  hidePerPageChooser?: boolean;
  perPage?: number;
}) => {
  const location = useLocation();

  const currentPage = Number(router.getParam(location, 'page')) || 1;
  const perPage =
    Number(router.getParam(location, 'perPage')) || props.perPage || 20;

  let totalPagesCount = parseInt((count / perPage).toString(), 10) + 1;

  if (count % perPage === 0) {
    totalPagesCount -= 1;
  }

  // calculate page numbers
  const pages = generatePages(totalPagesCount, currentPage) as any;

  const childProps = {
    count,
    currentPage,
    isPaginated: totalPagesCount > 1,
    totalPagesCount,
    pages,
    hidePerPageChooser
  };

  return <Pagination {...childProps} />;
};

export default PaginationContainer;
