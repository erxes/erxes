import { useTranslation } from 'react-i18next';
import { TagsSelect, useCompaniesEdit } from 'ui-modules';
import { toast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';

export const TagsField = ({
  _id,
  tagType,
  selected,
}: {
  _id: string;
  tagType: string;
  selected: string[];
}) => {
  const { companiesEdit } = useCompaniesEdit();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <TagsSelect
      type={tagType}
      value={selected}
      mode="multiple"
      onValueChange={(tagIds: string[]) => {
        companiesEdit({
          variables: { _id, tagIds },
          onError: (e: ApolloError) => {
            toast({
              title: t('error-title'),
              description: e.message,
              variant: 'destructive',
            });
          },
        });
      }}
    />
  );
};
