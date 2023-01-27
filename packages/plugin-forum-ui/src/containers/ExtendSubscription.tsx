import React, { useState } from 'react';
import ChooseUser from './ChooseUser';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import {
  timeDuractionUnits,
  TimeDurationUnit
} from '../components/SubscriptionProductForm';

const MUT = gql`
  mutation ForumManuallyExtendSubscription(
    $cpUserId: ID!
    $multiplier: Float!
    $price: Float!
    $unit: ForumTimeDurationUnit!
    $userType: ForumCpUserType!
  ) {
    forumManuallyExtendSubscription(
      cpUserId: $cpUserId
      multiplier: $multiplier
      price: $price
      unit: $unit
      userType: $userType
    ) {
      _id
    }
  }
`;

const CP_USER_QUERY = gql`
  query ClientPortalUserDetail($id: String!) {
    clientPortalUserDetail(_id: $id) {
      _id
      email
      username
      type
      forumSubscriptionEndsAfter
    }
  }
`;

const ExtendSubscription: React.FC = () => {
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [chosenUserId, setChosenUserId] = useState<any>(null);
  const [multiplier, setMultiplier] = useState(0);
  const [unit, setUnit] = useState<TimeDurationUnit>('months');
  const [price, setPrice] = useState<number>(0);

  const userQuery = useQuery(CP_USER_QUERY, {
    variables: {
      id: chosenUserId
    }
  });

  const [mutExtend] = useMutation(MUT, {
    refetchQueries: ['ClientPortalUserDetail']
  });

  const onClickExtend = () => {
    if (!chosenUserId) {
      alert('Please select a user first');
      return;
    }

    if (!userQuery.data?.clientPortalUserDetail) {
      alert('User detail not found');
      return;
    }
    const user = userQuery.data?.clientPortalUserDetail;
    mutExtend({
      variables: {
        cpUserId: user._id,
        multiplier,
        price,
        unit,
        userType: user.type
      }
    });
  };

  return (
    <div>
      <div>
        <h4>User:</h4>
        {!chosenUserId && <p>No user selected</p>}
        {chosenUserId && userQuery.data?.clientPortalUserDetail && (
          <table>
            <tbody>
              <tr>
                <th>Email:</th>
                <td>{userQuery.data.clientPortalUserDetail.email}</td>
              </tr>
              <tr>
                <th>Username:</th>
                <td>{userQuery.data.clientPortalUserDetail.username}</td>
              </tr>
              <tr>
                <th>Type:</th>
                <td>{userQuery.data.clientPortalUserDetail.type}</td>
              </tr>
              <tr>
                <th>Subscription ends after:</th>
                <td>
                  {userQuery.data.clientPortalUserDetail
                    .forumSubscriptionEndsAfter || 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <button onClick={() => setShowUserSelect(true)}>Change user</button>

        <ChooseUser
          show={showUserSelect}
          onChoose={u => {
            setChosenUserId(u);
            setShowUserSelect(false);
          }}
          onCancel={() => setShowUserSelect(false)}
        />
      </div>

      <div>
        <h4>Subscription extension details:</h4>
        <table>
          <tr>
            <th>Multiplier:</th>
            <td>
              <input
                type="number"
                value={multiplier}
                onChange={e => setMultiplier(parseFloat(e.target.value))}
                required
                min={0}
              />
            </td>
            <th>Unit:</th>
            <td>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as TimeDurationUnit)}
              >
                {timeDuractionUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>Paid amount in MNT</th>
            <td colSpan={3}>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(parseFloat(e.target.value))}
                required
                min={0}
              />
            </td>
          </tr>
        </table>
        <button type="button" onClick={onClickExtend}>
          Extend
        </button>
      </div>
    </div>
  );
};
export default ExtendSubscription;
