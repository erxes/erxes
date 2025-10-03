import { ICycleProgressByProject } from '@/cycle/types';
import { ProjectInline } from '@/project/components/ProjectInline';
import { useProjects } from '@/project/hooks/useGetProjects';

type Props = {
  projectId: string;
  progress: ICycleProgressByProject[];
};

const CycleProjectDetail = (props: Props) => {
  const { projectId, progress } = props;

  const { projects, loading } = useProjects({
    variables: {
      _ids: progress?.map((item) => item.projectId),
    },
    skip: !progress?.length,
  });

  if (loading) {
    return null;
  }

  const project = projects?.find((p) => p._id === projectId);

  return <ProjectInline project={project} projectId={projectId} />;
};

export default CycleProjectDetail;
