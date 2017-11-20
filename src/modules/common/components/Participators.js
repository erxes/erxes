import React from 'react';
import PropTypes from 'prop-types';
import { ParticipatorWrapper, ParticipatorImg } from 'modules/inbox/styles';
import { Label, Tip } from 'modules/common/components';
import { colors } from 'modules/common/styles';

function Participators({ participatedUsers, limit, stretchRight }) {
  const length = participatedUsers.length;

  return (
    <ParticipatorWrapper length={length}>
      {participatedUsers.slice(0, limit ? limit : length).map(user => (
        <Tip
          key={user._id}
          placement="top"
          text={'Participator ' + user.username}
        >
          <ParticipatorImg key={user._id} src={user.details.avatar || []} />
        </Tip>
      ))}
      {limit &&
        length - limit > 0 && (
          <Label
            style={{ backgroundColor: colors.colorCoreLightGray }}
            stretchRight={stretchRight}
          >
            {`+${length - limit}`}
          </Label>
        )}
    </ParticipatorWrapper>
  );
}

Participators.propTypes = {
  participatedUsers: PropTypes.array.isRequired,
  limit: PropTypes.number,
  stretchRight: PropTypes.func
};

export default Participators;
