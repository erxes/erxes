import { getService, getServices } from './serviceDiscovery';

export interface ISegmentContentType {
  type: string;
  description: string;
  esIndex: string;
  notAssociated?: boolean;
  hideInSidebar?: boolean;
}

export interface IDependentService {
  name: string;
  twoWay?: boolean;
  associated?: boolean;
}

export const getName = (type: string) => type.split(':')[1];

export const getEsIndexByContentType = async (contentType: string) => {
  const [serviceName, type] = contentType.split(':');

  const service = await getService(serviceName, true);

  const segmentMeta = (service.config.meta || {}).segments;

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
  serviceName: string,
  gatherTypes: (
    contentType: ISegmentContentType,
    sName: string,
    depService: IDependentService
  ) => void
) => {
  const serviceNames = await getServices();

  for (const sName of serviceNames) {
    const service = await getService(sName, true);
    const segmentMeta = (service.config.meta || {}).segments;

    if (!segmentMeta) {
      continue;
    }

    const dependentServices = segmentMeta.dependentServices || [];
    const contentTypes = segmentMeta.contentTypes || [];

    for (const dService of dependentServices) {
      if (dService.name !== serviceName || !dService.twoWay) {
        continue;
      }

      for (const contentType of contentTypes) {
        gatherTypes(contentType, sName, dService);
      }
    }
  }
};

export const gatherAssociatedTypes = async (contentType: string) => {
  const [serviceName, currentType] = contentType.split(':');
  const service = await getService(serviceName, true);
  const segmentMeta = (service.config.meta || {}).segments;

  const associatedTypes: string[] = [];

  if (segmentMeta) {
    const { contentTypes } = segmentMeta;

    // gather current services associatedTypes
    for (const ct of contentTypes) {
      if (ct.type !== currentType && !ct.notAssociated) {
        associatedTypes.push(`${serviceName}:${ct.type}`);
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
          associatedTypes
        );
      }
    }
  }

  // gather current services dependentServices associatedTypes
  await gatherDependentServicesType(
    serviceName,
    (ct: ISegmentContentType, sName: string, depService: IDependentService) => {
      if (!depService.associated || ct.notAssociated) {
        return;
      }

      associatedTypes.push(`${sName}:${ct.type}`);
    }
  );

  return associatedTypes;
};

const gatherServicesAssociatedTypes = async (
  serviceName: string,
  associatedTypes: string[]
) => {
  const service = await getService(serviceName, true);
  const segmentMeta = (service.config.meta || {}).segments;

  if (!segmentMeta) {
    return;
  }

  const contentTypes = segmentMeta.contentTypes || [];

  for (const contentType of contentTypes) {
    if (contentType.notAssociated) {
      continue;
    }

    associatedTypes.push(`${serviceName}:${contentType.type}`);
  }
};
