import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import Select from 'react-select';
import Histories from '../../containers/Histories';
import { IAutomation, ITrigger } from '../../types';
import { FilterDateItem, FilterWrapper, HistoriesWrapper } from './styles';

type Props = {
  automation: IAutomation;
  triggersConst: ITrigger[];
  actionsConst: any[];
  queryParams: any;
};

type State = {
  page?: number;
  perPage?: number;
  status?: string;
  triggerId?: string;
  triggerType?: string;
  beginDate?: Date;
  endDate?: Date;
};

export default function HistoriesContainer(props: Props) {
  const [filterParams, setFilterParams] = useState<State>({
    page: props.queryParams?.page ? parseInt(props.queryParams.page) : 1,
    perPage: 18
  });

  const { automation, triggersConst } = props;

  const onSelect = (
    name: string,
    selectedItem: string & { value: string; label?: string }
  ) => {
    const value = selectedItem ? selectedItem.value : '';

    setFilterParams({ [name]: value } as unknown as Pick<State, keyof State>);
  };

  const onDateChange = (type: string, date) => {
    const filter = { ...filterParams };

    if (date) {
      filter[type] = dayjs(date).format('YYYY-MM-DD HH:mm');
    } else {
      filter.beginDate = undefined;
      filter.endDate = undefined;
    }

    setFilterParams(filter);
  };

  // const onFilter = (e) => {
  //   const { status, triggerId, triggerType, beginDate, endDate } = this.state;

  //   setFilterParams({
  //     status,
  //     triggerId,
  //     triggerType,
  //     beginDate,
  //     endDate
  //   });
  // };

  const renderDateFilter = (key: string, name: string) => {
    const props = {
      value: filterParams[key],
      inputProps: {
        placeholder: `${__(`Filter by ${__(name)}`)}`
      }
    };

    return (
      <FilterDateItem>
        <div className="icon-option">
          <Icon icon="calendar-alt" />
          <Datetime
            {...props}
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            onChange={onDateChange.bind(this, key)}
            closeOnSelect={true}
          />
        </div>
      </FilterDateItem>
    );
  };

  const { status, triggerId, triggerType } = filterParams;

  const triggerOptions = [
    ...automation.triggers.map((t) => ({
      value: t.id,
      label: t.label
    }))
  ];
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'error', label: 'Error' },
    { value: 'missed', label: 'Missed' },
    { value: 'complete', label: 'Complete' }
  ];
  const triggerTypeOptions = [
    ...triggersConst.map((t) => ({
      value: t.type,
      label: t.label
    }))
  ];

  return (
    <HistoriesWrapper>
      <FilterWrapper>
        {renderDateFilter('beginDate', 'Begin Date')}
        {renderDateFilter('endDate', 'End Date')}
        <FilterDateItem>
          <div className="icon-option">
            <Icon icon="checked-1" />
            <Select
              placeholder={__('Filter by Status')}
              isClearable={true}
              value={statusOptions.find((o) => o.value === status)}
              options={statusOptions}
              onChange={onSelect.bind(this, 'status')}
            />
          </div>
        </FilterDateItem>
        <FilterDateItem>
          <div className="icon-option">
            <Icon icon="swatchbook" />
            <Select
              placeholder={__('Filter by Trigger')}
              isClearable={true}
              value={triggerOptions.find((o) => o.value === triggerId)}
              options={triggerOptions}
              onChange={onSelect.bind(this, 'triggerId')}
            />
          </div>
        </FilterDateItem>
        <FilterDateItem>
          <div className="icon-option">
            <Icon icon="cell" />
            <Select
              placeholder={__('Filter by Trigger Type')}
              isClearable={true}
              value={triggerTypeOptions.find((o) => o.value === triggerType)}
              options={triggerTypeOptions}
              onChange={onSelect.bind(this, 'triggerType')}
            />
          </div>
        </FilterDateItem>
        {/* <Button
          btnStyle="primary"
          icon="filter-1"
          onClick={onFilter}
          size="small"
        >
          {'Filter'}
        </Button> */}
      </FilterWrapper>
      <Histories {...props} filterParams={filterParams} />
    </HistoriesWrapper>
  );
}
// class HistoriesHeader extends React.Component<Props, State> {
//   constructor(props) {
//     super(props);

//     this.state = {
//       filterParams: {
//         page: 0,
//         perPage: 18
//       }
//     };
//   }

//   onSelect = (
//     name: string,
//     selectedItem: string & { value: string; label?: string }
//   ) => {
//     const value = selectedItem ? selectedItem.value : '';

//     this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
//   };

//   onDateChange = (type: string, date) => {
//     const filter = { ...this.state };

//     if (date) {
//       filter[type] = dayjs(date).format('YYYY-MM-DD HH:mm');
//     } else {
//       filter.beginDate = undefined;
//       filter.endDate = undefined;
//     }

//     this.setState(filter);
//   };

//   onFilter = (e) => {
//     const { status, triggerId, triggerType, beginDate, endDate } = this.state;

//     this.setState({
//       filterParams: {
//         status,
//         triggerId,
//         triggerType,
//         beginDate,
//         endDate
//       }
//     });
//   };

//   renderDateFilter = (key: string, name: string) => {
//     const props = {
//       value: this.state[key],
//       inputProps: {
//         placeholder: `${__(`Filter by ${__(name)}`)}`
//       }
//     };

//     return (
//       <FilterDateItem>
//         <div className="icon-option">
//           <Icon icon="calendar-alt" />
//           <Datetime
//             {...props}
//             dateFormat="YYYY/MM/DD"
//             timeFormat="HH:mm"
//             onChange={this.onDateChange.bind(this, key)}
//             closeOnSelect={true}
//           />
//         </div>
//       </FilterDateItem>
//     );
//   };

//   render() {
//     const { automation, triggersConst } = this.props;
//     const { status, triggerId, triggerType, filterParams } = this.state;

//     const triggerOptions = [
//       ...automation.triggers.map((t) => ({
//         value: t.id,
//         label: t.label
//       }))
//     ];
//     const statusOptions = [
//       { value: 'active', label: 'Active' },
//       { value: 'waiting', label: 'Waiting' },
//       { value: 'error', label: 'Error' },
//       { value: 'missed', label: 'Missed' },
//       { value: 'complete', label: 'Complete' }
//     ];
//     const triggerTypeOptions = [
//       ...triggersConst.map((t) => ({
//         value: t.type,
//         label: t.label
//       }))
//     ];

//     return (
//       <HistoriesWrapper>
//         <FilterWrapper>
//           {this.renderDateFilter('beginDate', 'Begin Date')}
//           {this.renderDateFilter('endDate', 'End Date')}
//           <FilterDateItem>
//             <div className="icon-option">
//               <Icon icon="checked-1" />
//               <Select
//                 placeholder={__('Filter by Status')}
//                 isClearable={true}
//                 value={statusOptions.find((o) => o.value === status)}
//                 options={statusOptions}
//                 onChange={this.onSelect.bind(this, 'status')}
//               />
//             </div>
//           </FilterDateItem>
//           <FilterDateItem>
//             <div className="icon-option">
//               <Icon icon="swatchbook" />
//               <Select
//                 placeholder={__('Filter by Trigger')}
//                 isClearable={true}
//                 value={triggerOptions.find((o) => o.value === triggerId)}
//                 options={triggerOptions}
//                 onChange={this.onSelect.bind(this, 'triggerId')}
//               />
//             </div>
//           </FilterDateItem>
//           <FilterDateItem>
//             <div className="icon-option">
//               <Icon icon="cell" />
//               <Select
//                 placeholder={__('Filter by Trigger Type')}
//                 isClearable={true}
//                 value={triggerTypeOptions.find((o) => o.value === triggerType)}
//                 options={triggerTypeOptions}
//                 onChange={this.onSelect.bind(this, 'triggerType')}
//               />
//             </div>
//           </FilterDateItem>
//           <Button
//             btnStyle="primary"
//             icon="filter-1"
//             onClick={this.onFilter}
//             size="small"
//           >
//             {'Filter'}
//           </Button>
//         </FilterWrapper>
//         <Histories {...this.props} filterParams={filterParams} />
//       </HistoriesWrapper>
//     );
//   }
// }

// export default HistoriesHeader;
