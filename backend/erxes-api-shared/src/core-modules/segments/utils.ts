import { getPlugin, getPlugins } from '../../utils';
import { IDependentService, ISegmentContentType } from './types';

export const getEsIndexByContentType = async (contentType: string) => {
  const [pluginName, type] = contentType.split(':');

  const plugin = await getPlugin(pluginName);

  const segmentMeta = (plugin.config.meta || {}).segments;

  if (segmentMeta) {
    const { contentTypes } = segmentMeta;

    for (const ct of contentTypes) {
      if (ct.type === type && ct.esIndex) {
        return ct.esIndex;
      }
    }
  }

  return '';
};

export const gatherDependentServicesType = async (
  pluginName: string,
  gatherTypes: (
    contentType: ISegmentContentType,
    pName: string,
    depService: IDependentService,
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
  const segmentMeta = (plugin.config.meta || {}).segments;

  const associatedTypes: string[] = [];

  if (segmentMeta) {
    const { contentTypes } = segmentMeta;

    // gather current services associatedTypes
    for (const ct of contentTypes) {
      if (ct.type !== currentType && !ct.notAssociated) {
        associatedTypes.push(`${pluginName}:${ct.type}`);
      }
    }

    // gather current services dependentServices associatedTypes
    if (segmentMeta.dependentServices) {
      const dependentServices = segmentMeta.dependentServices || [];

      for (const dependentService of dependentServices) {
        if (!dependentService.associated) {
          continue;
        }

        await gatherServicesAssociatedTypes(
          dependentService.name,
          associatedTypes,
        );
      }
    }
  }

  // gather current services dependentServices associatedTypes
  await gatherDependentServicesType(
    pluginName,
    (ct: ISegmentContentType, pName: string, depService: IDependentService) => {
      if (!depService.associated || ct.notAssociated) {
        return;
      }

      associatedTypes.push(`${pName}:${ct.type}`);
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

    associatedTypes.push(`${pluginName}:${contentType.type}`);
  }
};
