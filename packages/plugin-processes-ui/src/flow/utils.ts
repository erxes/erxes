import { confirm, Alert } from '@erxes/ui/src/utils';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { colors } from '@erxes/ui/src/styles';
import { IJob } from '../flow/types';

export const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: '#a1a1a1'
};

export const hoverPaintStyle = {
  fill: colors.colorPrimary
};

export const connectorHoverStyle = {
  stroke: colors.colorPrimary
};

export const sourceEndpoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorSecondary, 1),
    radius: 10
  },
  isSource: true,
  connector: [
    'Bezier',
    { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
  ],
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle,
  connectorHoverStyle,
  dropOptions: {
    tolerance: 'touch',
    hoverClass: 'dropHover',
    activeClass: 'dragActive'
  }
};

// export const morePoint = {
//   endpoint: 'Dot',
//   paintStyle: {
//     fill: rgba(colors.colorCoreGray, 1),
//     radius: 10
//   },
//   isSource: true,
//   connector: [
//     'Bezier',
//     { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
//   ],
//   connectorStyle: connectorPaintStyle,
//   hoverPaintStyle,
//   connectorHoverStyle,
//   anchor: [1, 0.7],
//   overlays: [
//     [
//       'Label',
//       {
//         location: [1.9, 0.6],
//         label: '+1',
//         visible: true,
//         labelStyle: {
//           color: colors.colorCoreGray
//         }
//       }
//     ]
//   ]
// };

export const targetEndpoint = {
  endpoint: 'Dot',
  paintStyle: { fill: rgba(colors.colorCoreYellow, 1), radius: 10 },
  hoverPaintStyle: {
    fill: colors.colorPrimary
  },
  maxConnections: -1,
  dropOptions: { hoverClass: 'hover', activeClass: 'active' },
  isTarget: true
};

export const createInitialConnections = (flowJobs: IJob[], instance: any) => {
  for (const flowJob of flowJobs) {
    const jobIds = flowJob.nextJobIds || [];

    jobIds.map(job =>
      instance.connect({
        source: `flowJob-${flowJob.id}`,
        target: `flowJob-${job}`,
        anchors: ['Right', 'Left']
      })
    );
  }
};

export const connection = (
  flowJobs: IJob[],
  info: any,
  flowJobId: any,
  type: string
) => {
  const sourceId = info.sourceId;

  if (sourceId.includes('flowJob')) {
    let innerFlowJobs: IJob[] = [];

    const replacedSourceId: string = sourceId.replace('flowJob-', '');

    const sourceFlowJob = flowJobs.find(
      a => a.id.toString() === replacedSourceId
    );

    innerFlowJobs = flowJobs.filter(a => a.id.toString() !== replacedSourceId);

    if (sourceFlowJob && sourceFlowJob.id) {
      let jobIds = [...(sourceFlowJob.nextJobIds || [])];

      if (type === 'connect') {
        if (!jobIds.includes(flowJobId)) {
          jobIds.push(flowJobId);
        }
      } else {
        const leftJobIds = jobIds.filter(j => j !== flowJobId);
        jobIds = leftJobIds;
      }

      sourceFlowJob.nextJobIds = jobIds;

      innerFlowJobs.push(sourceFlowJob);
    }

    return innerFlowJobs;
  } else {
    return flowJobs;
  }
};

export const deleteConnection = instance => {
  instance.bind('click', (conn, event) => {
    confirm(
      'Delete connection from ' + conn.sourceId + ' to ' + conn.targetId + '?'
    )
      .then(() => instance.deleteConnection(conn))
      .catch(error => {
        Alert.error(error.message);
      });
  });
};
