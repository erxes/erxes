import React from 'react';
import RewardForm from './components/RewardForm';
import ScoreForm from './components/ScoreForm';
import SpinForm from './components/SpinForm';
import LoyaltyForm from './containers/LoyaltyForm';

const Automations = (props) => {
  const { componentType, activeAction, activeTrigger } = props;

  if (componentType === 'actionForm') {
    const { type } = activeAction;
    const [serviceName, contentType, action] = type
      .replace('.', ':')
      .split(':');

    switch (contentType) {
      case 'voucher':
        return <LoyaltyForm {...props} />;
      case 'score':
        return <ScoreForm {...props} />;
      case 'spin':
        return <SpinForm {...props} />;

      default:
        return null;
    }
  }
  if (componentType === 'historyActionResult') {
    const { action, result } = props || {};
    const { actionType } = action || {};
    const [_, contentType] = actionType.replace('.', ':').split(':');

    if (contentType === 'score') {
      const { changeScore, ownerType, ownerId, action } = result || {};

      const links = {
        customer: 'contacts/details',
        company: 'companies/details',
        teamMember: 'settings/team/details',
      };

      const verb = action === 'add' ? 'added to' : 'subtracted from';

      const target =
        ownerType === 'customer'
          ? 'a customer'
          : ownerType === 'company'
            ? 'a company'
            : 'a team member';

      const scoreText = `${changeScore} point${changeScore !== 1 ? 's' : ''}`;

      // Full link (without leading slash to prevent nested route issues)
      const detailLink = `/${links[ownerType]}/${ownerId}`;

      return (
        <p>
          {scoreText} {verb} {target}.{' '}
          <a href={detailLink} target="_blank" rel="noopener noreferrer">
            View details
          </a>
          .
        </p>
      );
    }

    return <>{'-'}</>;
  }

  if (componentType === 'triggerForm') {
    const [_serviceName, contentType] = activeTrigger?.type.split(':');

    if (contentType === 'reward') {
      return <RewardForm {...props} />;
    }

    return null;
  }
};

export default Automations;
