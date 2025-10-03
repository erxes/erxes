import { isEnabled, sendTRPCMessage } from "erxes-api-shared/utils";
import { IModels } from "~/connectionResolvers";

export const getConfig = async (
    code: string,
    defaultValue?: string
  ) => {

    const configs = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'core',
        action: 'getConfigs',
        input: {},
        defaultValue: [],
    })
  
    if (!configs[code]) {
      return defaultValue;
    }
  
    return configs[code];
  };

export const getConfigByHost = async (
    models: IModels,
    requestInfo,
    clientPortalName?,
  ) => {
    const origin = requestInfo.headers.origin;
    const pattern = `.*${origin}.*`;
  
    let config = await models.Portals.findOne({ url: { $regex: pattern } });
  
    if (clientPortalName) {
      config = await models.Portals.findOne({
        name: clientPortalName,
      });
    }
  
    if (!config) {
      throw new Error('Not found');
    }
  
    return config;
  };
  

  export const sendSms = async (
    type: string,
    phoneNumber: string,
    content: string
  ) => {
    if (type === 'messagePro') {
      const MESSAGE_PRO_API_KEY = await getConfig(
        'MESSAGE_PRO_API_KEY',
        
        ''
      );
  
      const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
        'MESSAGE_PRO_PHONE_NUMBER',
        
        ''
      );
  
      if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
        throw new Error('messaging config not set properly');
      }
  
      try {
        await fetch(
          'https://api.messagepro.mn/send?' +
            new URLSearchParams({
              key: MESSAGE_PRO_API_KEY,
              from: MESSAGE_PRO_PHONE_NUMBER,
              to: phoneNumber,
              text: content,
            })
        );
  
        return 'sent';
      } catch (e) {
        console.error(e.message);
        throw new Error(e.message);
      }
    }
  
    const isServiceEnabled = await isEnabled(type);
  
    if (!isServiceEnabled) {
      throw new Error('messaging service not enabled');
    }
    
    await sendTRPCMessage({
        pluginName: type,
        method: 'mutation',
        module: type,
        action: 'sendSms',
        input: { phoneNumber, content },
    });
  };

  export const buildCustomFieldsMap = async (
    fieldGroups: any[],
    customFieldsData: any
  ) => {
    const jsonMap: any = {};
  
    if (fieldGroups.length > 0) {
      for (const fieldGroup of fieldGroups) {


        const fields = await sendTRPCMessage({
          pluginName: 'core',
          method: 'query',
          module: 'core',
          action: 'fields.find',
          input: { query: { groupId: fieldGroup._id } },
        });
  
        jsonMap[fieldGroup.code] = fields.reduce((acc, field: any) => {
          const value = customFieldsData.find((c: any) => c.field === field._id);
          acc[field.code] = value ? value.value : null;
          return acc;
        }, {});
      }
    }
  
    return jsonMap;
  };
  
  export const customFieldsDataByFieldCode = async (object) => {
    const customFieldsData =
      object.customFieldsData && object.customFieldsData.toObject
        ? object.customFieldsData.toObject()
        : object.customFieldsData || [];
  
    const fieldIds = customFieldsData.map((data) => data.field);
  
    const fields = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'core',
      action: 'fields.find',
      input: { query: { _id: { $in: fieldIds } } },
    });
  
    const fieldCodesById = {};
  
    for (const field of fields) {
      fieldCodesById[field._id] = field.code;
    }
  
    const results: any = {};
  
    for (const data of customFieldsData) {
      results[fieldCodesById[data.field]] = {
        ...data,
      };
    }
  
    return results;
  };
  