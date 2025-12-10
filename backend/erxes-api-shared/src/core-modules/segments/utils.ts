import { getPlugin, getPlugins } from '../../utils';
import {
  ISegmentDependentModule,
  ISegmentContentType,
  SegmentConfigs,
} from './types';

export const gatherDependentServicesType = async (
  pluginName: string,
  gatherTypes: (
    contentType: ISegmentContentType,
    pName: string,
    depService: ISegmentDependentModule,
  ) => void,
) => {
  const pluginNames = await getPlugins();

  for (const pName of pluginNames) {
    const plugin = await getPlugin(pName);
    const segmentMeta = (plugin.config.meta || {}).segments;

    if (!segmentMeta) {
      continue;
    }

    const dependentServices = segmentMeta.dependentServices || [];
    const contentTypes = segmentMeta.contentTypes || [];

    for (const dService of dependentServices) {
      if (dService.name !== pluginName || !dService.twoWay) {
        continue;
      }

      for (const contentType of contentTypes) {
        if (
          !!dService?.types?.length &&
          !(dService?.types || []).includes(contentType?.type)
        ) {
          continue;
        }

        gatherTypes(contentType, pName, dService);
      }
    }
  }
};
export const gatherAssociatedTypes = async (contentType: string) => {
  const [pluginName, currentType] = contentType.split(':');
  const plugin = await getPlugin(pluginName);
  const segmentMeta = (plugin.config.meta || {}).segments as SegmentConfigs;

  const associatedTypes: string[] = [];

  if (segmentMeta) {
    const { contentTypes } = segmentMeta;

    // gather current services associatedTypes
    for (const ct of contentTypes) {
      if (ct.type !== currentType && !ct.notAssociated) {
        associatedTypes.push(`${pluginName}:${ct.moduleName}.${ct.type}`);
      }
    }

    // gather current services dependentServices associatedTypes
    if (segmentMeta.dependentModules) {
      const dependentModules = segmentMeta.dependentModules || [];

      for (const dependentModule of dependentModules) {
        if (!dependentModule.associated) {
          continue;
        }

        await gatherServicesAssociatedTypes(
          dependentModule.name,
          associatedTypes,
        );
      }
    }
  }

  // gather current services dependentServices associatedTypes
  await gatherDependentServicesType(
    pluginName,
    (
      ct: ISegmentContentType,
      pName: string,
      depService: ISegmentDependentModule,
    ) => {
      if (!depService.associated || ct.notAssociated) {
        return;
      }

      associatedTypes.push(`${pName}:${ct.moduleName}.${ct.type}`);
    },
  );

  return associatedTypes;
};

const gatherServicesAssociatedTypes = async (
  pluginName: string,
  associatedTypes: string[],
) => {
  const plugin = await getPlugin(pluginName);
  const segmentMeta = (plugin.config.meta || {}).segments;

  if (!segmentMeta) {
    return;
  }

  const contentTypes = segmentMeta.contentTypes || [];

  for (const contentType of contentTypes) {
    if (contentType.notAssociated) {
      continue;
    }

    associatedTypes.push(
      `${pluginName}:${contentType.moduleName}.${contentType.type}`,
    );
  }
};
