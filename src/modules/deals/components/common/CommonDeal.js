import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ModalTrigger, Icon } from 'modules/common/components';
import { DealEditForm } from '../../containers';
import { ItemCounter, UserCounter } from '../';
import { Date, Amount, Footer, ContainerHover } from '../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

class Deal extends React.Component {
  showEditForm() {
    const { deal, saveDeal, removeDeal, moveDeal } = this.props;

    const trigger = (
      <ContainerHover>
        <div>
          <Icon icon="edit" />
        </div>
      </ContainerHover>
    );

    return (
      <ModalTrigger title="Edit deal" trigger={trigger} size="lg">
        <DealEditForm
          deal={deal}
          saveDeal={saveDeal}
          moveDeal={moveDeal}
          removeDeal={removeDeal}
        />
      </ModalTrigger>
    );
  }

  renderDate(closeDate) {
    if (!closeDate) return null;

    return (
      <Date>
        <Icon icon="android-time" /> {moment(closeDate).format('YYYY-MM-DD')}
      </Date>
    );
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <Amount>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} <span>{key}</span>
          </p>
        ))}
      </Amount>
    );
  }

  render() {
    const { deal } = this.props;
    const products = (deal.products || []).map(p => p.product);

    return (
      <Fragment>
        <h4>{deal.name}</h4>

        <ItemCounter items={products} />
        <ItemCounter color="#F7CE53" items={deal.companies || []} />
        <ItemCounter color="#3CCC38" items={deal.customers || []} />

        <Footer>
          {this.renderAmount(deal.amount || {})}
          {this.renderDate(deal.closeDate)}

          <UserCounter users={deal.assignedUsers || []} />
        </Footer>

        {this.showEditForm()}
      </Fragment>
    );
  }
}

Deal.propTypes = propTypes;

export default Deal;
