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

export const yesEndPoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorCoreGreen, 1),
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
  anchor: [1, 0.3],
  overlays: [
    [
      'Label',
      {
        location: [1.8, 0.5],
        // label: 'True',
        visible: true,
        labelStyle: {
          color: colors.colorCoreGreen
        }
      }
    ]
  ]
};

export const noEndPoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorCoreRed, 1),
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
  anchor: [1, 0.7],
  overlays: [
    [
      'Label',
      {
        location: [1.9, 0.6],
        label: 'False',
        visible: true,
        labelStyle: {
          color: colors.colorCoreRed
        }
      }
    ]
  ]
};

// the definition of target endpoints (will appear when the user drags a connection)
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

export const createInitialConnections = (actions: IJob[], instance: any) => {
  for (const action of actions) {
    const jobIds = action.nextJobIds;

    // for (const job of jobIds) {
    //   if (job) {
    //     instance.connect({
    //       source: `action-${action.id}`,
    //       target: `action-${job}`,
    //       anchors: ['Right', 'Left']
    //     });
    //   }
    // }

    jobIds.map(job =>
      instance.connect({
        source: `action-${action.id}`,
        target: `action-${job}`,
        anchors: ['Right', 'Left']
      })
    );

    // if (jobIds.length && jobIds[1]) {
    //   instance.connect({
    //     source: `action-${action.id}`,
    //     target: `action-${jobIds[1]}`,
    //     anchors: ['Right', 'Left']
    //   });
    // }

    // if (jobIds.length && jobIds[0]) {
    //   instance.connect({
    //     source: `action-${action.id}`,
    //     target: `action-${jobIds[0]}`,
    //     anchors: ['Right', 'Left']
    //   });
    // }
  }
};

export const connection = (
  actions: IJob[],
  info: any,
  actionId: any,
  type: string
) => {
  const sourceId = info.sourceId;

  console.log('info:', sourceId, actionId, type);

  if (sourceId.includes('action')) {
    const sourceAction = actions.find(
      a => a.id.toString() === sourceId.replace('action-', '')
    );

    if (sourceAction) {
      let jobIds = sourceAction.nextJobIds;

      if (type === 'connect') {
        if (!jobIds.includes(actionId)) {
          jobIds.push(actionId);
        }
      } else {
        const leftJobIds = jobIds.filter(j => j !== actionId);
        jobIds = leftJobIds;
      }

      sourceAction.nextJobIds = jobIds;
    }
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

export const getTriggerType = (
  actions: any,
  triggers: any,
  activeActionId: string
) => {
  const activeTrigger = triggers.find(t => t.actionId === activeActionId);

  if (activeTrigger) {
    return activeTrigger.type;
  }

  const activeAction = actions.find(t => t.nextJobIds[0] === activeActionId);

  if (activeAction) {
    return getTriggerType(actions, triggers, activeAction.id);
  }

  if (triggers && triggers.length > 0) {
    return triggers[0].type;
  }

  return;
};
