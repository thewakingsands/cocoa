import bunyanDebugStream from 'bunyan-debug-stream'
import * as bunyan from 'bunyan'
import { dirname } from 'path'

export function createLogger(name: string) {
  return bunyan.createLogger({
    name,
    streams: [
      {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        type: 'raw',
        stream: bunyanDebugStream({
          basepath: dirname(__dirname),
          showDate: false,
          showPid: false,
        }),
      },
    ],
    serializers: (bunyanDebugStream as any).serializers,
  })
}
