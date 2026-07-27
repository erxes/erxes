import { TagsSelect, useCompaniesEdit } from 'ui-modules';
import { toast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

export const TagsField = ({
  _id,
  tagType,
  selected,
}: {
  _id: string;
  tagType: string;
  selected: string[];
}) => {
  const { t } = useTranslation('contact');
  const { companiesEdit } = useCompaniesEdit();
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
              title: t('error', 'Error'),
              description: e.message,
              variant: 'destructive',
            });
          },
        });
      }}
    />
  );
};
