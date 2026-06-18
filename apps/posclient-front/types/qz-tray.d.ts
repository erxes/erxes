declare module "qz-tray" {
  interface ConnectOptions {
    host?: string | string[]
    usingSecure?: boolean
    keepAlive?: number
    retries?: number
    delay?: number
  }

  interface PrintConfig {
    reconfigure(options: Record<string, unknown>): void
    getPrinter(): string | { name?: string; file?: string; host?: string }
    setPrinter(printer: string | Record<string, unknown>): void
    getOptions(): Record<string, unknown>
    setOptions(options: Record<string, unknown>): void
  }

  interface PrintData {
    type?: string
    format?: string
    flavor?: string
    data: string
    options?: Record<string, unknown>
  }

  interface QzWebsocket {
    isActive(): boolean
    connect(options?: ConnectOptions): Promise<void>
    disconnect(): Promise<void>
  }

  interface QzPrinters {
    getDefault(): Promise<string>
    find(query?: string): Promise<string | string[]>
    details(): Promise<unknown>
  }

  interface QzConfigs {
    setDefaults(options: Record<string, unknown>): void
    create(
      printer: string | Record<string, unknown>,
      options?: Record<string, unknown>
    ): PrintConfig
  }

  interface QzApi {
    setPromiseType(
      promiser: (resolver: (...args: unknown[]) => void) => Promise<unknown>
    ): void
    setSha256Type(hasher: (message: string) => string | Promise<string>): void
    setWebSocketType(ws: unknown): void
  }

  interface QzSecurity {
    setCertificatePromise(handler: unknown): void
    setSignaturePromise(handler: unknown): void
  }

  interface QzTray {
    websocket: QzWebsocket
    printers: QzPrinters
    configs: QzConfigs
    api: QzApi
    security: QzSecurity
    print(
      configs: PrintConfig | PrintConfig[],
      data: Array<PrintData | string> | Array<Array<PrintData | string>>
    ): Promise<void>
    version: string
  }

  const qz: QzTray
  export default qz
}
