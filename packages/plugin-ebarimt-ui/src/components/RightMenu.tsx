import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React, { useRef, useState, ChangeEvent, KeyboardEvent } from 'react';
import RTG from 'react-transition-group';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { __ } from '@erxes/ui/src/utils';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent,
} from '../styles';
import { IQueryParams } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
  showMenu?: boolean;
};

type State = {
  showMenu: boolean;
  currentTab: string;
  filterParams: IQueryParams;
};

const RightMenu: React.FC<Props> = (props) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<State>({
    currentTab: 'Filter',
    showMenu: props.showMenu || false,
    filterParams: props.queryParams,
  });

  const setFilter = () => {
    const { filterParams } = state;
    props.onFilter({ ...filterParams, page: '1' });
  };

  const setWrapperRef = (node: HTMLDivElement | null) => {
    if (node) {
      wrapperRef.current = node;
    }
  };

  const toggleMenu = () => {
    setState((prevState) => ({ ...prevState, showMenu: !prevState.showMenu }));
  };

  const onSearch = (e) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      props.onSearch(target.value || '', target.name || 'search');
    }
  };

  const onChangeInput = (e) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    const { filterParams } = state;
    setState({ ...state, filterParams: { ...filterParams, [name]: value } });
  };

  const renderLink = (label: string, key: string, value: string) => {
    const { onSelect, queryParams } = props;

    const selected = queryParams[key] === value;

    const onClick = (_e) => {
      onSelect(value, key);
    };

    return (
      <FilterButton selected={selected} onClick={onClick}>
        {__(label)}
        {selected && <Icon icon="check-1" size={14} />}
      </FilterButton>
    );
  };

  const onChangeRangeFilter = (kind: string, date: Date) => {
    const { filterParams } = state;
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    setState({ ...state, filterParams: { ...filterParams, [kind]: cDate } });
  };

  const renderSpecials = () => {
    return <>{renderLink('Only Today', 'paidDate', 'today')}</>;
  };

  const renderRange = (dateType: string) => {
    const { filterParams } = state;

    const lblStart = `${dateType}StartDate`;
    const lblEnd = `${dateType}EndDate`;

    return (
      <>
        <ControlLabel>{`${dateType} Date range:`}</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblStart]}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={onChangeRangeFilter.bind(null, lblStart)}
              viewMode={'days'}
              className={'filterDate'}
            />
          </div>

          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblEnd]}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={onChangeRangeFilter.bind(null, lblEnd)}
              viewMode={'days'}
              className={'filterDate'}
            />
          </div>
        </CustomRangeContainer>
      </>
    );
  };

  const renderContentType = () => {
    const { filterParams } = state;
    const { contentType = '' } = filterParams;

    if (contentType === 'pos') {
      return (
        <FormGroup>
          <ControlLabel>{`Order number`}</ControlLabel>
          <FormControl
            name={'orderNumber'}
            defaultValue={filterParams.orderNumber}
            placeholder={__('Search value')}
            onKeyPress={onSearch}
            autoFocus={true}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    }

    if (contentType === 'deal') {
      const onChangeBoard = (boardId: string) => {
        setState({
          ...state,
          filterParams: { ...state.filterParams, boardId },
        });
      };

      const onChangePipeline = (pipelineId: string) => {
        setState({
          ...state,
          filterParams: { ...state.filterParams, pipelineId },
        });
      };

      const onChangeStage = (stageId: string) => {
        setState({
          ...state,
          filterParams: { ...state.filterParams, stageId },
        });
      };

      return (
        <>
          <FormGroup>
            <ControlLabel>{`Deal name`}</ControlLabel>
            <FormControl
              name={'dealName'}
              defaultValue={filterParams.dealName}
              placeholder={__('Search value')}
              onKeyPress={onSearch}
              autoFocus={true}
              onChange={onChangeInput}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Stage</ControlLabel>
            <BoardSelectContainer
              type="deal"
              autoSelectStage={false}
              boardId={filterParams.boardId}
              pipelineId={filterParams.pipelineId}
              stageId={filterParams.stageId}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
              onChangeStage={onChangeStage}
            />
          </FormGroup>
        </>
      );
    }

    if (contentType === 'loans:transaction') {
      return (
        <>
          <FormGroup>
            <ControlLabel>{`Contract number`}</ControlLabel>
            <FormControl
              name={'contractNumber'}
              defaultValue={filterParams.contractNumber}
              placeholder={__('Search value')}
              onKeyPress={onSearch}
              autoFocus={true}
              onChange={onChangeInput}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{`Transaction number`}</ControlLabel>
            <FormControl
              name={'transactionNumber'}
              defaultValue={filterParams.transactionNumber}
              placeholder={__('Search value')}
              onKeyPress={onSearch}
              autoFocus={true}
              onChange={onChangeInput}
            />
          </FormGroup>
        </>
      );
    }
    return null;
  };

  const renderFilter = () => {
    const { filterParams } = state;

    return (
      <FilterBox>
        <FormGroup>
          <ControlLabel>{`Bill ID`}</ControlLabel>
          <FormControl
            name={'search'}
            defaultValue={filterParams.search}
            placeholder={__('Number ...')}
            onKeyPress={onSearch}
            autoFocus={true}
            onChange={onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Content Type`}</ControlLabel>
          <FormControl
            name={'contentType'}
            componentClass="select"
            defaultValue={filterParams.contentType}
            onChange={onChangeInput}
          >
            <option value="">{__('All')}</option>
            {isEnabled('cards') && <option value="deal">{__('Deal')}</option>}
            {isEnabled('pos') && <option value="pos">{__('Pos')}</option>}
            {isEnabled('loans') && (
              <option value="loans:transaction">
                {__('Loan Transaction')}
              </option>
            )}
          </FormControl>
        </FormGroup>

        {renderContentType()}

        <FormGroup>
          <ControlLabel>{`Success`}</ControlLabel>
          <FormControl
            name={'success'}
            componentClass="select"
            defaultValue={filterParams.success}
            onChange={onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="true">{__('true')}</option>
            <option value="false">{__('false')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Bill Type`}</ControlLabel>
          <FormControl
            name={'billType'}
            componentClass="select"
            defaultValue={filterParams.billType}
            onChange={onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="1">{__('1')}</option>
            <option value="3">{__('3')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Bill ID Rule`}</ControlLabel>
          <FormControl
            name={'billIdRule'}
            componentClass="select"
            defaultValue={filterParams.billIdRule}
            onChange={onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="10">{__('Only has bill Id')}</option>
            <option value="01">{__('Only has return bill Id')}</option>
            <option value="11">{__('Both')}</option>
            <option value="00">{__('Both not')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`On Last`}</ControlLabel>
          <FormControl
            name={'isLast'}
            componentClass="select"
            defaultValue={filterParams.isLast}
            onChange={onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="1">{__('on last')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>{renderRange('created')}</FormGroup>

        <FormGroup>{renderSpecials()}</FormGroup>
      </FilterBox>
    );
  };

  const renderTabContent = () => {
    return (
      <>
        <TabContent>{renderFilter()}</TabContent>
        <MenuFooter>
          <Button
            block={true}
            btnStyle="success"
            uppercase={false}
            onClick={setFilter}
            icon="filter"
          >
            {__('Filter')}
          </Button>
        </MenuFooter>
      </>
    );
  };

  const { showMenu } = state;
  const { isFiltered } = props;

  return (
    <div ref={setWrapperRef}>
      {isFiltered && (
        <Button
          btnStyle="warning"
          icon="times-circle"
          uppercase={false}
          onClick={props.clearFilter}
        >
          {__('Clear Filter')}
        </Button>
      )}
      <Button
        btnStyle="simple"
        uppercase={false}
        icon="bars"
        onClick={toggleMenu}
      >
        {showMenu ? __('Hide Filter') : __('Show Filter')}
      </Button>

      <RTG.CSSTransition
        in={showMenu}
        timeout={300}
        classNames="slide-in-right"
        unmountOnExit={true}
      >
        <RightMenuContainer>{renderTabContent()}</RightMenuContainer>
      </RTG.CSSTransition>
    </div>
  );
};

export default RightMenu;
