import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React from 'react';
import RTG from 'react-transition-group';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  MainStyleDateContainer as DateContainer
} from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/utils';
import {
  CustomRangeContainer,
  FilterBox,
  FilterButton,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../../styles';
import { IQueryParams } from '@erxes/ui/src/types';
import {
  BOW_TYPES,
  BRAKE_TYPES,
  DRIVING_CLASSIFICATION,
  MANUFACTURE_TYPES,
  TIRE_LOAD_TYPES,
  TRAILER_TYPES
} from '../../constants';
import DateControl from '@erxes/ui/src/components/form/DateControl';

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

const generateOptionsConstants = (items, isEmpty = false) => {
  const result: React.ReactNode[] = [];

  if (isEmpty) {
    result.push(
      <option key={''} value={''}>
        Сонгоно уу.
      </option>
    );
  }

  for (const item of items) {
    result.push(
      <option key={item.value} value={item.value}>
        {item.label}
      </option>
    );
  }

  return result;
};

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
    this.props.onFilter(filterParams);
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
    this.setState({
      filterParams: { ...filterParams, [key]: String(values) }
    });
  };

  onChangeInput = e => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    const { filterParams } = this.state;

    this.setState({
      filterParams: { ...filterParams, [name]: value }
    });
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
    this.setState({
      filterParams: { ...filterParams, [kind]: cDate }
    });
  };

  onDateChangeFilter = (field, date) => {
    const { filterParams } = this.state;
    this.setState({
      filterParams: { ...filterParams, [field]: date }
    } as any);
  };

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
              inputProps={{
                placeholder: __('Click to select a date')
              }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams[lblStart] || null}
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
              inputProps={{
                placeholder: __('Click to select a date')
              }}
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

  renderFilter() {
    const { filterParams } = this.state;

    return (
      <FilterBox>
        <FormGroup>
          <ControlLabel>{`Улсын дугаар`}</ControlLabel>
          <FormControl
            name={'plateNumber'}
            defaultValue={filterParams.plateNumber}
            placeholder={__('Улсын дугаар ...')}
            onKeyPress={this.onSearch}
            autoFocus={true}
            onChange={this.onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Арлын дугаар`}</ControlLabel>
          <FormControl
            name={'vinNumber'}
            defaultValue={filterParams.vinNumber}
            placeholder={__('Арлын дугаар ...')}
            onKeyPress={this.onSearch}
            onChange={this.onChangeInput}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Үйлдвэрлэсэн он`}</ControlLabel>
          <FormControl
            name={'vintageYear'}
            type="number"
            defaultValue={filterParams.vintageYear}
            placeholder={__('Үйлдвэрлэсэн он ...')}
            onKeyPress={this.onSearch}
            onChange={this.onChangeInput}
            min={1950}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Импортолсон он`}</ControlLabel>
          <FormControl
            name={'importYear'}
            type="number"
            defaultValue={filterParams.importYear}
            placeholder={__('Импортолсон он ...')}
            onKeyPress={this.onSearch}
            onChange={this.onChangeInput}
            min={1950}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Оношлогоо огноо`}</ControlLabel>
          <DateContainer>
            <DateControl
              required={false}
              name="diagnosisDate"
              placeholder={__('Оношлогоо огноо')}
              value={filterParams.diagnosisDate}
              onChange={this.onDateChangeFilter.bind(this, 'diagnosisDate')}
            />
          </DateContainer>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Татвар огноо`}</ControlLabel>
          <DateContainer>
            <DateControl
              required={false}
              name="taxDate"
              placeholder={__('Татвар огноо')}
              value={filterParams.taxDate}
              onChange={this.onDateChangeFilter.bind(this, 'taxDate')}
            />
          </DateContainer>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Ангилал`}</ControlLabel>
          <FormControl
            name={'drivingClassification'}
            componentClass="select"
            defaultValue={filterParams.drivingClassification}
            onChange={this.onChangeInput}
          >
            {generateOptionsConstants(DRIVING_CLASSIFICATION, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Үйлдвэрлэгч`}</ControlLabel>
          <FormControl
            name={'manufacture'}
            componentClass="select"
            defaultValue={filterParams.manufacture}
            onChange={this.onChangeInput}
          >
            {generateOptionsConstants(MANUFACTURE_TYPES, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Чиргүүлийн холбоос`}</ControlLabel>
          <FormControl
            name={'trailerType'}
            componentClass="select"
            defaultValue={filterParams.trailerType}
            onChange={this.onChangeInput}
          >
            {generateOptionsConstants(TRAILER_TYPES, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Тоормосны төрөл`}</ControlLabel>
          <FormControl
            name={'brakeType'}
            componentClass="select"
            defaultValue={filterParams.brakeType}
            onChange={this.onChangeInput}
          >
            {generateOptionsConstants(BRAKE_TYPES, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Нумны төрөл`}</ControlLabel>
          <FormControl
            name={'bowType'}
            componentClass="select"
            defaultValue={filterParams.bowType}
            onChange={this.onChangeInput}
          >
            {generateOptionsConstants(BOW_TYPES, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>{`Дугуйн даацын төрөл`}</ControlLabel>
          <FormControl
            name={'tireLoadType'}
            componentClass="select"
            defaultValue={filterParams.tireLoadType}
            onChange={this.onChangeInput}
          >
            {generateOptionsConstants(TIRE_LOAD_TYPES, true)}
          </FormControl>
        </FormGroup>

        <FormGroup>{this.renderRange('created')}</FormGroup>
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
