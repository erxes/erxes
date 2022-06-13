import { Spinner } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import dayjs from 'dayjs';
import moment from 'moment';
import React from 'react';
import { CardBorder, Column, Container, Description } from '../../../../styles';

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
      <div>
        <strong>{head}:</strong>
        {isdate ? parseDate(value) : value}
      </div>
    );

    return (
      <>
        <Container>
          <p>
            <strong>Title:</strong>
            {lotteryCampaign?.title}
          </p>
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
            head="Finish Date of Use"
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
          {loading ? (
            <Spinner />
          ) : (
            <Column>
              {data.map((item, i) => {
                return (
                  <CardBorder key={i}>
                    <div>
                      <strong>Title: </strong>
                      {item.title}
                    </div>
                    <div>
                      <strong>Buy Score: </strong>
                      {item.buyScore}
                    </div>
                    <div>
                      <strong>Finish Date of Use</strong>
                      {dayjs(item.finishDateOfUse).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </CardBorder>
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
