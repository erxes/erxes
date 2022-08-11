import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React from 'react';
import RTG from 'react-transition-group';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from '@erxes/ui/src/components';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { __ } from '@erxes/ui/src/utils';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../styles';
import { IQueryParams } from '@erxes/ui/src/types';

type Props = {
  onSearch: (search: string, key?: string) => void;
  onFilter: (filterParams: IQueryParams) => void;
  onSelect: (values: string[] | string, key: string) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
};

type StringState = {
  currentTab: string;
};

type State = {
  showMenu: boolean;
  filterParams: IQueryParams;
} & StringState;

export default class RightMenu extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'Filter',
      showMenu: false,

      filterParams: this.props.queryParams
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
  }

  setFilter = () => {
    const { filterParams } = this.state;
    this.props.onFilter({ ...filterParams, page: '1' });
  };

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || '', target.name || 'search');
    }
  };

  onSelect = (values: string[] | string, key: string) => {
    const { filterParams } = this.state;
    this.setState({ filterParams: { ...filterParams, [key]: String(values) } });
  };

  onChangeInput = e => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    const { filterParams } = this.state;
    this.setState({ filterParams: { ...filterParams, [name]: value } });
  };

  renderLink(label: string, key: string, value: string) {
    const { onSelect, queryParams } = this.props;

    const selected = queryParams[key] === value;

    const onClick = _e => {
      onSelect(value, key);
    };

    return (
      <FilterButton selected={selected} onClick={onClick}>
        {__(label)}
        {selected && <Icon icon="check-1" size={14} />}
      </FilterButton>
    );
  }

  onChangeRangeFilter = (kind, date) => {
    const { filterParams } = this.state;
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    this.setState({ filterParams: { ...filterParams, [kind]: cDate } });
  };

  renderSpecials() {
    return <>{this.renderLink('Only Today', 'paidDate', 'today')}</>;
  }

  renderRange(dateType: string) {
    const { filterParams } = this.state;

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
              onChange={this.onChangeRangeFilter.bind(this, lblStart)}
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
              onChange={this.onChangeRangeFilter.bind(this, lblEnd)}
              viewMode={'days'}
              className={'filterDate'}
            />
          </div>
        </CustomRangeContainer>
      </>
    );
  }

  renderContentType() {
    const { filterParams } = this.state;
    const { contentType = '' } = filterParams;

    if (contentType === 'pos') {
      return (
        <FormGroup>
          <ControlLabel>{`Order number`}</ControlLabel>
          <FormControl
            name={'orderNumber'}
            defaultValue={filterParams.orderNumber}
            placeholder={__('Search value')}
            onKeyPress={this.onSearch}
            autoFocus={true}
            onChange={this.onChangeInput}
          />
        </FormGroup>
      );
    }

    if (contentType === 'deal') {
      const onChangeBoard = (boardId: string) => {
        this.setState({
          filterParams: { ...this.state.filterParams, boardId }
        });
      };

      const onChangePipeline = (pipelineId: string) => {
        this.setState({
          filterParams: { ...this.state.filterParams, pipelineId }
        });
      };

      const onChangeStage = (stageId: string) => {
        this.setState({
          filterParams: { ...this.state.filterParams, stageId }
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
              onKeyPress={this.onSearch}
              autoFocus={true}
              onChange={this.onChangeInput}
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

    return '';
  }

  renderFilter() {
    const { filterParams } = this.state;

    return (
      <FilterBox>
        <FormGroup>
          <ControlLabel>{`Bill ID`}</ControlLabel>
          <FormControl
            name={'search'}
            defaultValue={filterParams.search}
            placeholder={__('Number ...')}
            onKeyPress={this.onSearch}
            autoFocus={true}
            onChange={this.onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Content Type`}</ControlLabel>
          <FormControl
            name={'contentType'}
            componentClass="select"
            defaultValue={filterParams.contentType}
            onChange={this.onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="deal">{__('Deal')}</option>
            <option value="pos">{__('Pos')}</option>
          </FormControl>
        </FormGroup>

        {this.renderContentType()}

        <FormGroup>
          <ControlLabel>{`Success`}</ControlLabel>
          <FormControl
            name={'success'}
            componentClass="select"
            defaultValue={filterParams.success}
            onChange={this.onChangeInput}
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
            onChange={this.onChangeInput}
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
            onChange={this.onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="10">{__('Only has bill Id')}</option>
            <option value="01">{__('Only has return bill Id')}</option>
            <option value="11">{__('Both')}</option>
            <option value="00">{__('Both not')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`on Last`}</ControlLabel>
          <FormControl
            name={'isLast'}
            componentClass="select"
            defaultValue={filterParams.isLast}
            onChange={this.onChangeInput}
          >
            <option value="">{__('All')}</option>
            <option value="1">{__('on last')}</option>
          </FormControl>
        </FormGroup>

        <FormGroup>{this.renderRange('created')}</FormGroup>

        <FormGroup>{this.renderSpecials()}</FormGroup>
      </FilterBox>
    );
  }

  renderTabContent() {
    return (
      <>
        <TabContent>{this.renderFilter()}</TabContent>
        <MenuFooter>
          <Button
            block={true}
            btnStyle="success"
            uppercase={false}
            onClick={this.setFilter}
            icon="filter"
          >
            {__('Filter')}
          </Button>
        </MenuFooter>
      </>
    );
  }

  render() {
    const { showMenu } = this.state;
    const { isFiltered } = this.props;

    return (
      <div ref={this.setWrapperRef}>
        {isFiltered && (
          <Button
            btnStyle="warning"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.clearFilter}
          >
            {__('Clear Filter')}
          </Button>
        )}
        <Button
          btnStyle="simple"
          uppercase={false}
          icon="bars"
          onClick={this.toggleMenu}
        >
          {showMenu ? __('Hide Filter') : __('Show Filter')}
        </Button>

        <RTG.CSSTransition
          in={this.state.showMenu}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightMenuContainer>{this.renderTabContent()}</RightMenuContainer>
        </RTG.CSSTransition>
      </div>
    );
  }
}
