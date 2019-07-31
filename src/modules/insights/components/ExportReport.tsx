import { IUser } from 'modules/auth/types';
import { ISelectedOption } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Select from 'react-select-plus';
import { IBrand } from '../../settings/brands/types';
import {
  Box,
  FlexItem,
  FlexRow,
  InsightContent,
  InsightTitle,
  InsightWrapper
} from '../styles';
import { IQueryParams } from '../types';
import { OptionsType } from '../utils';
import InboxFilter from './filter/InboxFilter';
import Sidebar from './Sidebar';

type Props = {
  brands: IBrand[];
  users: IUser[];
  queryParams: IQueryParams;
  history: any;
  exportReport: (args: { type: string; userId?: string }) => void;
};

class ExportReport extends React.Component<Props, { userId: string }> {
  constructor(props) {
    super(props);

    this.state = { userId: '' };
  }

  renderBox(name: string, image: string, type: string) {
    const { exportReport } = this.props;

    return (
      <Box onClick={exportReport.bind(this, { type })}>
        <a href="#name">
          <img src={image} alt={name} />
          <span>{__(name)}</span>
        </a>
      </Box>
    );
  }

  onSelectChange = (value: ISelectedOption) => {
    const userId = value ? value.value : '';
    this.setState({ userId });
  };

  selectOptions() {
    const { users } = this.props;
    const options: OptionsType[] = [];

    users.map(user =>
      options.push({
        value: user._id,
        label: (user.details && user.details.fullName) || user.username
      })
    );

    return options;
  }

  exportWithUser = () => {
    const { exportReport } = this.props;
    const { userId } = this.state;

    if (!userId) {
      Alert.error('Choose user');
    } else {
      exportReport({ type: 'firstResponseDuration', userId });
    }
  };

  renderContent() {
    const { brands, history, queryParams } = this.props;
    const { userId } = this.state;
    const onChange = value => this.onSelectChange(value);
    const options = option => (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );

    return (
      <InsightWrapper>
        <InboxFilter
          history={history}
          brands={brands}
          queryParams={queryParams}
        />
        <InsightContent>
          <InsightTitle>{__('Export Report')}</InsightTitle>

          <FlexRow>
            <div>
              {this.renderBox(
                'Volume Report By Date',
                '/images/icons/erxes-21.svg',
                'volumeByDate'
              )}

              {this.renderBox(
                'Volume Report By Time',
                '/images/icons/erxes-14.svg',
                'volumeByTime'
              )}

              {this.renderBox(
                'Operator Activity Report',
                '/images/icons/erxes-16.svg',
                'activity'
              )}
            </div>
          </FlexRow>

          <InsightTitle>
            <FlexRow>
              <FlexItem>{__('Export First Response Report')}</FlexItem>

              <FlexItem>
                <Select
                  placeholder={__('Choose user')}
                  value={userId}
                  onChange={onChange}
                  optionRenderer={options}
                  options={this.selectOptions()}
                />
              </FlexItem>
              <FlexItem />
            </FlexRow>
          </InsightTitle>

          <FlexRow>
            <div>
              {this.renderBox(
                'Duration of First Response Report',
                '/images/icons/erxes-06.svg',
                'firstResponseDuration'
              )}

              {this.renderBox(
                'First Response Report by Operators',
                '/images/icons/erxes-15.svg',
                'firstResponseOperators'
              )}

              <Box onClick={this.exportWithUser}>
                <a href="#img">
                  <img
                    src="/images/icons/erxes-16.svg"
                    alt="First Response Report by Operator"
                  />
                  <span>{__('First Response Report by Operator')}</span>
                </a>
              </Box>
            </div>
          </FlexRow>

          <InsightTitle>
            <FlexRow>
              <FlexItem>{__('Export Tag Report')}</FlexItem>
            </FlexRow>
          </InsightTitle>

          <FlexRow>
            <div>
              {this.renderBox(
                'Tag Report',
                '/images/icons/erxes-18.svg',
                'tag'
              )}
            </div>
          </FlexRow>
        </InsightContent>
      </InsightWrapper>
    );
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Export Report')} submenu={menuInbox} />
        }
        leftSidebar={<Sidebar queryParams={this.props.queryParams} />}
        content={this.renderContent()}
      />
    );
  }
}

export default ExportReport;
