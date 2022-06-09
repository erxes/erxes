import TaskTimer, { STATUS_TYPES } from '@erxes/ui/src/components/Timer';
import CompanySection from '@erxes/ui/src/companies/components/CompanySection';
import CustomerSection from '@erxes/ui/src/customers/components/CustomerSection';
import React from 'react';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import CustomFieldsSection from '../../containers/editForm/CustomFieldsSection';

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }) => void;
  options: IOptions;
  renderItems: () => React.ReactNode;
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
};

class SidebarConformity extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (nextProps.item.modifiedAt === this.props.item.modifiedAt) {
      return false;
    }
    return true;
  }

  render() {
    const { item, options, renderItems, updateTimeTrack } = this.props;

    const timeTrack = item.timeTrack || {
      timeSpent: 0,
      status: STATUS_TYPES.STOPPED
    };

    return (
      <RightContent>
        {isEnabled('contacts') && (
          <>
            <CompanySection mainType={options.type} mainTypeId={item._id} />
            <CustomerSection mainType={options.type} mainTypeId={item._id} />
          </>
        )}

        <TaskTimer
          taskId={item._id}
          status={timeTrack.status}
          timeSpent={timeTrack.timeSpent}
          startDate={timeTrack.startDate}
          update={updateTimeTrack}
        />

        {renderItems()}
        <CustomFieldsSection item={item} options={options} />
      </RightContent>
    );
  }
}

export default SidebarConformity;
