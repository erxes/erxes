import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { Avatar, readImage } from 'erxes-ui';
import { Can, CompanyName } from 'ui-modules';

export const CompanyDetailGeneral = () => {
  const { companyDetail } = useCompanyDetailWithQuery();
  const { _id, primaryName, primaryEmail, primaryPhone, avatar } =
    companyDetail || {};

  return (
    <div className="py-5 px-8 flex flex-col gap-6">
      <div className="flex gap-2 items-center flex-col lg:flex-row ">
        <Avatar size="lg" className="h-12 w-12">
          <Avatar.Image src={readImage(avatar)} />
          <Avatar.Fallback>
            {(primaryName || primaryEmail || primaryPhone)?.charAt(0)}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <Can
            action="contactsUpdate"
            fallback={
              <div className="px-3 py-2 text-base font-medium">
                {primaryName || 'Unknown'}
              </div>
            }
          >
            <CompanyName primaryName={primaryName} _id={_id} />
          </Can>
        </div>
      </div>
    </div>
  );
};
