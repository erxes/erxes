const commonParams = `
    $name: String,
    $description: String,
    $subdomain: String,
    $appToken: String,
    $startDate: String,
    $expireDate: String,
`;
const commonParamsDef = `
    name: $name,
    description: $description,
    subdomain: $subdomain,
    appToken: $appToken,
    startDate: $startDate,
    expireDate: $expireDate,
`;

const add = `
    mutation AddSaasSync(${commonParams}) {
      addSaasSync(${commonParamsDef})
    }
`;

const edit = `
    mutation EditSaasSync($_id:String,${commonParams}) {
      editSaasSync(_id:$_id,${commonParamsDef})
    }
`;

const remove = `
    mutation RemoveSaasSync($_id: String) {
      removeSaasSync(_id: $_id)
    }
`;

const saveConfig = `
mutation SaveSyncedSaasConfig($_id: String, $config: JSON) {
  saveSyncedSaasConfig(_id: $_id, config: $config)
}
`;

export default { add, edit, remove, saveConfig };
