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

export const morePoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorCoreGray, 1),
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
        label: '+1',
        visible: true,
        labelStyle: {
          color: colors.colorCoreGray
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
    let innerActions = [];

    const replacedSourceId = sourceId.replace('action-', '');

    console.log('replacedSourceId:', replacedSourceId);

    const sourceAction = actions.find(
      a => a.id.toString() === replacedSourceId
    );

    innerActions = actions.filter(a => a.id.toString() !== replacedSourceId);

    console.log(
      'replacedSourceId:',
      replacedSourceId,
      sourceAction,
      innerActions
    );

    if (
      Object.keys(sourceAction).length > 0 &&
      sourceAction.id === replacedSourceId
    ) {
      let jobIds = sourceAction.nextJobIds;

      console.log('object keys sourceAction step1:', jobIds);

      if (type === 'connect') {
        if (!jobIds.includes(actionId)) {
          jobIds.push(actionId);
        }
      } else {
        const leftJobIds = jobIds.filter(j => j !== actionId);
        jobIds = leftJobIds;
      }

      sourceAction.nextJobIds = jobIds;

      console.log('object keys sourceAction step2:', jobIds);
    }
    innerActions.push(sourceAction);
    return innerActions;
  } else {
    return actions;
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
