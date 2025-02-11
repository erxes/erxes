import { getConfig } from '../../../utils/utils';
import { IContext } from '../../../connectionResolver';
import { checkAndSaveObj, getObject, getPullPolaris } from '../../../utils/pullUtils';

const pullPolarisQueries = {
  async pullPolarisConfigs(_root, { contentType }: { contentType: string }, { models, subdomain }: IContext) {
    const polarisConfigs = await getConfig(subdomain, 'PULL_POLARIS', {});

    return polarisConfigs.filter(pc => pc.contentType === contentType);
  },

  async pullPolarisData(_root, { contentId, contentType, kind, codes }: { contentId: string, contentType: string, kind: string, codes: string[] }, { models, subdomain }: IContext) {
    const pullConfigs: any[] = await getConfig(subdomain, 'PULL_POLARIS', {}) || [];
    const polarisConfig: any[] = await getConfig(subdomain, 'POLARIS', {}) || [];

    const filteredConfigs = pullConfigs.filter(
      pc => pc.contentType === contentType && pc.kind === kind && codes.includes(pc.code)
    );

    const result: any[] = [];

    const object = await getObject(subdomain, contentId, contentType);
    const erxesModifier: any = { customFieldsData: object.customFieldsData }
    let modifierChanged = false;

    for (const conf of filteredConfigs) {
      try {
        const response = await getPullPolaris(subdomain, polarisConfig, object, conf.code)
        result.push({
          ...conf,
          response
        });

        for (const respKey of Object.keys(conf.extra || {})) {
          const rule = conf.extra[respKey];
          const newVal = response[respKey];
          if (!newVal) {
            continue;
          }

          if (rule.propType) {
            if (object[rule.propType] !== newVal) {
              erxesModifier[rule.propType] = newVal;
              modifierChanged = true;
            }
          } else {
            const oldVal = object.customFieldsData.find(cfd => cfd.field === rule.fieldId)?.value;
            if (oldVal !== newVal) {
              erxesModifier.customFieldsData = [
                ...erxesModifier.customFieldsData.filter(cfd => cfd.field !== rule.fieldId),
                {
                  field: rule.fieldId, value: newVal, stringValue: newVal.toString()
                }
              ]
              modifierChanged = true;
            }
          }
        }
      } catch (e) {
        result.push({
          ...conf,
          response: { error: e.message }
        })
      }
    }

    if (modifierChanged) {
      await checkAndSaveObj(subdomain, contentType, contentId, erxesModifier);
    }

    return result;
  },
};

export default pullPolarisQueries;
