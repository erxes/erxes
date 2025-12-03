import { useParams } from 'react-router-dom';
import { useGetResponse } from '@/responseTemplate/hooks/useGetRespone';
import { CreateResponseForm } from '@/responseTemplate/components/CreateResponseForm';
import { Form, Button, Skeleton, toast } from 'erxes-ui';
import { useUpdateResponse } from '@/responseTemplate/hooks/useUpdateResponses';
import { useEffect } from 'react';
import { TUpdateResponseForm } from '@/responseTemplate/types';

export const ResponseDetail = () => {
  const { responseId } = useParams<{
    responseId: string;
  }>();
  const { response, loading } = useGetResponse(responseId);
  const { updateResponse } = useUpdateResponse();

  const handleSubmit = (data: TUpdateResponseForm) => {
    updateResponse({
      variables: { ...data, id: responseId },
      onCompleted: (res) => {
        toast({ title: 'Success!' });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (loading || !response) {
    return (
      <div className="p-4">
        <Skeleton className="w-32 h-8 mb-4" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <span className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          {loading ? <Skeleton className="w-32 h-5" /> : response?.name}
        </h1>
      </span>
      <main className="space-y-6 pb-10">
        <section className="mt-4 w-full border border-muted-foreground/15 rounded-md">
          <div className="w-full p-4">
            <CreateResponseForm
              onSubmit={handleSubmit}
              defaultValues={response}
              type="update"
            />
          </div>
        </section>
      </main>
    </div>
  );
};
