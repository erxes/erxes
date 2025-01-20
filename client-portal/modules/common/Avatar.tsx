import { IUser, IUserDetails } from '../types';

import dayjs from 'dayjs';
import { __ } from '../../utils';
import { Avatars } from '../knowledgeBase/components/styles';
import Icon from './Icon';
import { readFile } from './utils';

type Props = {
  user: IUser & { status?: string };
  date: { modifiedAt: Date; publishedAt: Date };
  viewCount: number;
};

export default function Avatar({
  user = {} as IUser & { status?: string },
  date,
  viewCount,
}: Props) {
  if (!user || !user.details) {
    return null;
  }

  const { details = {} as IUserDetails, status } = user;
  const { fullName, avatar } = details;

  return (
    <Avatars>
      <img
        className="round-img"
        alt={fullName}
        src={avatar ? readFile(avatar) : '/static/avatar-colored.svg'}
      />
      <div className="detail avatar-info d-flex flex-wrap">
        <div>
          <div>
            {__(`${status || 'Written'} by`)}
            <span>{fullName}</span>
          </div>
          <div className="d-flex align-items-center">
            <Icon icon="eye" size={14} />
            <span>{viewCount}</span>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <div>
            {__('Modified at')}
            <span>{dayjs(date.modifiedAt).format('MMM D YYYY')}</span>
          </div>
          {status === 'Published' && date.publishedAt && (
            <div>
              {__('Published at')}
              <span>{dayjs(date.publishedAt).format('MMM D YYYY')}</span>
            </div>
          )}
        </div>
      </div>
    </Avatars>
  );
}
