import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  reportType: string;
  maxParents: number;
};

function TableHeaders(props: Props) {
  const { reportType, maxParents } = props;

  const renderParentBranchColumns = () => {
    const returnElements: any = [];

    if (maxParents) {
      returnElements.push(
        <th
          rowSpan={2}
          style={{ textAlign: 'center', border: '1px solid #EEE' }}
        >
          {__('Parent Branch')}
        </th>
      );
    }

    return returnElements;
  };
  switch (reportType) {
    case 'Урьдчилсан':
      return (
        <>
          <tr>
            <th>{__('№')}</th>
            <th>{__('Team member Id')}</th>
            <th>{__('Last Name')}</th>
            <th>{__('First Name')}</th>
            <th>{__('Position')}</th>
            <th>{__('Scheduled days')}</th>
            <th>{__('Worked days')}</th>
            <th>{__('Explanation')}</th>
          </tr>
        </>
      );
    case 'Сүүлд':
      return (
        <>
          <tr>
            {renderParentBranchColumns()}

            <th
              rowSpan={2}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Салбар')}
            </th>
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Овог нэр')}
            </th>
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Ажилтаны код')}
            </th>
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Албан тушаал')}
            </th>
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Ажилвал зохих цаг')}
            </th>
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Ажилласан цаг')}
            </th>
            <th
              colSpan={3}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Хүсэлт')}
            </th>
            <th
              colSpan={7}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Суутгал')}
            </th>
          </tr>
          <tr>
            <th>{__('Ээлжийн амралт')}</th>
            <th>{__('Чөлөөтэй цаг')}</th>
            <th>{__('Өвчтэй')}</th>
            <th>{__('Бүртгэл дутуу')}</th>
            <th>{__('Б/Д мөнгө')}</th>
            <th>{__('Үр дүн хасалт')}</th>
            <th>{__('Хоцорсон миниут')}</th>
            <th>{__('Хоцролтын мөнгө')}</th>
            <th>{__('Үр дүн хасалт')}</th>
            <th>{__('Тасалсан өдөр')}</th>
            <th>{__('Торгууль')}</th>
            <th>{__('Үр дүн хасалт')}</th>
            <th>{__('Суутгал нэгдсэн')}</th>
          </tr>
        </>
      );
    case 'Pivot':
      return (
        <>
          <tr>
            <th
              colSpan={4}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Generar Information')}
            </th>
            <th>{__('Time')}</th>
            <th
              colSpan={3}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Schedule')}
            </th>
            <th
              colSpan={8}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Performance')}
            </th>
          </tr>
          <tr>
            <th>{__('№')}</th>
            <th>{__('Team member Id')}</th>
            <th>{__('Last Name')}</th>
            <th>{__('First Name')}</th>
            <th>{__('Position')}</th>
            <th>{__('Date')}</th>
            <th>{__('Planned Check In')}</th>
            <th>{__('Planned Check Out')}</th>
            <th>{__('Planned Duration')}</th>
            <th>{__('Check In')}</th>
            <th>{__('In Device')}</th>
            <th>{__('Check Out')}</th>
            <th>{__('Out Device')}</th>
            <th>{__('Location')}</th>
            <th>{__('Duration')}</th>
            <th>{__('Overtime')}</th>
            <th>{__('Overnight')}</th>
            <th>{__('Mins Late')}</th>
          </tr>
        </>
      );

    default:
      return null;
  }
}

export default TableHeaders;
