import { UserLinks } from '@/settings/team-member/types';
import { USER_LINK_FIELDS } from '../../constants/memberDetailFields';
import { LinkInput } from './fields/LinkInput';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';

export const MemberLinks = () => {
  const { userDetail } = useUserDetail();
  return (
    <div className="grid grid-cols-2 gap-3 w-full p-6">
      {USER_LINK_FIELDS.map((field) => (
        <LinkInput
          key={field.name}
          label={field.label}
          linkField={field.name}
          _id={userDetail?._id ?? ''}
          links={userDetail?.links as UserLinks}
          InputIcon={field.Icon}
        />
      ))}
    </div>
  );
};
