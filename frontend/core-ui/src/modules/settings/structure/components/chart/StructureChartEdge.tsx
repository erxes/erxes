import { IconPlus } from '@tabler/icons-react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useStructureChartContext } from '../../contexts/StructureChartContext';
import { TStructureChartEdge } from '../../types/structureChart';

const DASHED_STYLE = { strokeDasharray: '4 4' };

export const StructureChartEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<TStructureChartEdge>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { showActions, openCreate } = useStructureChartContext();
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });
  const childCode = data?.childCode;
  // The path bends halfway down, so this point sits on the child's own segment
  const buttonStyle = {
    transform: `translate(-50%, -50%) translate(${targetX}px, ${
      targetY - (targetY - sourceY) / 4
    }px)`,
  };

  const handleInsert = () => {
    if (childCode) {
      openCreate({
        parentId: source,
        insertBefore: { _id: target, code: childCode },
      });
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={data?.isPlaceholder ? DASHED_STYLE : undefined}
      />
      {showActions && childCode && (
        <EdgeLabelRenderer>
          <Button
            variant="secondary"
            size="icon"
            style={buttonStyle}
            className="nodrag nopan pointer-events-auto absolute size-5 rounded-full border hover:border-primary hover:text-primary"
            aria-label={t('insert-here')}
            title={t('insert-here')}
            onClick={handleInsert}
          >
            <IconPlus className="size-3" />
          </Button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
