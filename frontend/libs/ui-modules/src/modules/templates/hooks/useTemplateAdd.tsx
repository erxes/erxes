import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { TEMPLATE_ADD } from '../graphql/mutations';

export interface ITemplateAdd {
  name?: string;
  description?: string;
  contentType?: string;
  contentId?: string;
}

export interface ITemplateAddResponse {
  templateAdd: {
    _id: string;
  };
}

export const useTemplateAdd = () => {
  const [mutate, { loading }] = useMutation<ITemplateAddResponse, ITemplateAdd>(
    TEMPLATE_ADD,
  );

  const templateAdd = ({
    variables,
    onError,
    onCompleted,
    ...options
  }: MutationHookOptions<ITemplateAddResponse, ITemplateAdd>) => {
    return mutate({
      ...options,
      variables,
      onCompleted: (data) => {
        if (onCompleted) {
          onCompleted(data);
        }
        toast({
          title: 'Success',
          description: 'Template added successfully',
          variant: 'default',
        });
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        }
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { templateAdd, loading };
};
