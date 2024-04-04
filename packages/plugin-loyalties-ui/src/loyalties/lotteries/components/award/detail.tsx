import { CollapseContent, Spinner, Tip } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import dayjs from 'dayjs';
import moment from 'moment';
import React from 'react';
import {
  CardBorder,
  Column,
  Container,
  Description,
  Divider
} from '../../../../styles';

type State = {};

interface IProps extends IRouterProps {
  lotteryCampaign: any;
  data: any;
  loading: boolean;
}

class LotteryDetail extends React.Component<IProps, State> {
  constructor(props) {
    super(props);
  }

  render() {
    const { lotteryCampaign, data, loading } = this.props;

    const parseDate = (value: any) => {
      return moment(value).format('MM/D/YYYY');
    };

    const RowDiv = ({ head, value, isdate }) => (
      <Divider>
        <span>
          {head}
          <footer>{isdate ? parseDate(value) : value}</footer>
        </span>
      </Divider>
    );

    return (
      <>
        <Container>
          <div>
            <RowDiv
              head="Title"
              isdate={false}
              value={lotteryCampaign?.title}
            />
            <RowDiv
              head="Buy Score"
              isdate={false}
              value={lotteryCampaign?.buyScore}
            />
            <RowDiv
              head="Start Date"
              isdate={true}
              value={lotteryCampaign?.startDate}
            />

            <RowDiv
              head="End Date"
              isdate={true}
              value={lotteryCampaign?.endDate}
            />
            <RowDiv
              head="End of Use Date"
              isdate={true}
              value={lotteryCampaign?.finishDateOfUse}
            />
            <RowDiv
              head="Description"
              isdate={false}
              value={
                <Description
                  dangerouslySetInnerHTML={{
                    __html: lotteryCampaign?.description
                  }}
                />
              }
            />
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <Column>
              {data?.map((item, i) => {
                return (
                  <CollapseContent key={i} title={item.title}>
                    <RowDiv
                      head="Voucher Type"
                      isdate={false}
                      value={item.voucherType}
                    />
                    <RowDiv head="Status" isdate={false} value={item.status} />
                    <RowDiv
                      head="Buy Score"
                      isdate={false}
                      value={item.buyScore}
                    />
                    <RowDiv
                      head="Start Date"
                      isdate={true}
                      value={item.startDate}
                    />
                    <RowDiv
                      head="End Date"
                      isdate={true}
                      value={item.endDate}
                    />
                    <RowDiv
                      head="Finish Date of Use"
                      isdate={true}
                      value={item.finishDateOfUse}
                    />
                  </CollapseContent>
                );
              })}
            </Column>
          )}
        </Container>
      </>
    );
  }
}

export default LotteryDetail;
