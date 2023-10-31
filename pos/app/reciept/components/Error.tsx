const Error = ({
  message,
  errorCode,
}: {
  errorCode?: string
  message?: string
}) => {
  if (!errorCode || !message) return null
  return (
    <div className="py-1">
      {errorCode}: {message}
    </div>
  )
}

export default Error
