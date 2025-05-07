export default function keepTrying<T>(fn: () => Promise<T>) {
  let keepTrying = true

  const execute = (retryTime = 1000) => {
    fn().catch((error) => {
      console.debug(error)
      setTimeout(() => {
        if (keepTrying) {
          execute(retryTime * 1.5)
        }
      }, retryTime)
    })
  }
  execute()

  return () => {
    keepTrying = false
  }
}
