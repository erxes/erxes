import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React from 'react';
import RTG from 'react-transition-group';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import {
  CustomRangeContainer,
  FilterBox,
  MenuFooter,
  RightMenuContainer,
  TabContent
} from '../styles';
import { IQueryParams } from '@erxes/ui/src/types';

type Props = {
  onFilter: (filterParams: IQueryParams) => void;
  queryParams: any;
  isFiltered: boolean;
  clearFilter: () => void;
  showMenu?: boolean;
};

type StringState = {
  currentTab: string;
};

type State = {
  showMenu: boolean;
  filterParams: IQueryParams;
} & StringState;

export default class RightMenu extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'Filter',
      showMenu: this.props.showMenu || false,

      filterParams: this.props.queryParams
    };
  }

  setFilter = () => {
    const { filterParams } = this.state;
    this.props.onFilter({ ...filterParams, page: '1' });
  };

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  onChangeInput = e => {
    const { target } = e;
    const { name, value } = target;

    const { filterParams } = this.state;
    this.setState({ filterParams: { ...filterParams, [name]: value } });
  };

  onChangeRangeFilter = (kind, date) => {
    const { filterParams } = this.state;
    const cDate = dayjs(date).format('YYYY-MM-DD HH:mm');
    this.setState({ filterParams: { ...filterParams, [kind]: cDate } });
  };

  renderRange() {
    const { filterParams } = this.state;

    return (
      <>
        <ControlLabel>{`Date range:`}</ControlLabel>

        <CustomRangeContainer>
          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams.startDate}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={this.onChangeRangeFilter.bind(this, 'startDate')}
              viewMode={'days'}
              className={'filterDate'}
            />
          </div>

          <div className="input-container">
            <Datetime
              inputProps={{ placeholder: __('Click to select a date') }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm"
              value={filterParams.endDate}
              closeOnSelect={true}
              utc={true}
              input={true}
              onChange={this.onChangeRangeFilter.bind(this, 'endDate')}
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

        <FormGroup>{this.renderRange()}</FormGroup>
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
      <div>
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
