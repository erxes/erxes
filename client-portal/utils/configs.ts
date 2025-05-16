// get env config from process.env or window.env

export const getSubdomain = (): string => {
  if (typeof window !== "undefined") {
    return window.location.hostname.split(".")[0];
  }
  return "";
};

export const getEnv = (): any => {
  const envs = {};
  const subdomain = getSubdomain();

  if (typeof window !== "undefined") {
    for (const envMap of (window as any).envMaps) {
      envs[envMap.name] = localStorage
        .getItem(`cp_env_${envMap.name}`)
        .replace("<subdomain>", subdomain);
    }
  }

  return envs;
};
