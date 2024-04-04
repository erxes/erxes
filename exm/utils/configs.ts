// get env config from process.env or window.env
export const getEnv = (): any => {
  const envs = {};

  if (typeof window !== 'undefined') {
    for (const envMap of (window as any).envMaps) {
      envs[envMap.name] = localStorage.getItem(`cp_env_${envMap.name}`);
    }
  }

  return envs;
};
