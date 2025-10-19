import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetPipelines } from '@/settings/hooks/useGetPipelines';
export const PipelineDetail = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  console.log(pipelineId);
  const { pipeline } = useGetPipelines(pipelineId);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <span className="flex justify-between">
        <h1 className="text-2xl font-semibold">{pipeline?.name}</h1>
      </span>
      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md">
        <section className="w-full p-4">
          {/* {team && <UpdateTeamForm team={team} />} */}
        </section>
      </div>
      {/* <MemberSection team={team} />
      <EstimateSection team={team} />
      <StatusSection team={team} />
      <CycleSection team={team} />
      <DeleteTeamForm /> */}
    </div>
  );
};
