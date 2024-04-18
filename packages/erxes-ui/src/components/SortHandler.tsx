import React, { useState } from 'react';
import { colors } from '../styles';
import { router } from '../utils/core';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';

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

interface IProps {
  sortField?: string;
  label?: string;
}

const SortHandler: React.FC<IProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortValue, setSortValue] = useState<string | number>(
    router.getParam(location, 'sortDirection'),
  );
  const { sortField, label } = props;

  const sortHandle = (field, direction) => {
    router.setParams(navigate, location, {
      sortField: field,
      sortDirection: direction,
    });
  };

  const checkSortActive = (name, direction) => {
    if (
      router.getParam(location, 'sortField') === name &&
      router.getParam(location, 'sortDirection') === direction.toString()
    ) {
      return 'active';
    }

    return '';
  };

  const onClickSort = () => {
    if (!sortValue) {
      setSortValue(-1);

      return sortHandle(sortField, -1);
    }

    if (sortValue < 0) {
      setSortValue(1);

      return sortHandle(sortField, 1);
    }

    setSortValue('');

    return router.removeParams(
      navigate,
      location,
      'sortDirection',
      'sortField',
    );
  };

  return (
    <SortWrapper onClick={onClickSort}>
      <div>
        <span className={`arrow up ${checkSortActive(sortField, -1)}`} />
        <span className={`arrow down ${checkSortActive(sortField, 1)}`} />
      </div>
      {label}
    </SortWrapper>
  );
};

export default SortHandler;
