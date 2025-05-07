export const getSubdomain = (): string => {
  const hostnameParts = window.location.hostname.split(".")

  if (hostnameParts.length > 2) {
    return hostnameParts[0]
  }

  // return an empty string (for open-source environments with no subdomain)
  return ""
}

// get env config from process.env or window.env
export const getEnv = () => {
  const wenv = (window as any).env || {}
  console.log(process.env.NEXT_PUBLIC_CALLS_APP_ID, "window", wenv)
  const subdomain = getSubdomain()

  const getItem = (name: string) => {
    const value = wenv[name] || process.env[name] || ""
    // Only replace '<subdomain>' if it exists in the value
    if (value.includes("<subdomain>")) {
      return value.replace("<subdomain>", subdomain)
    }

    return value
  }

  return {
    CALLS_APP_ID: getItem("CALLS_APP_ID"),
    CALLS_APP_SECRET: getItem("CALLS_APP_SECRET"),
  }
}
