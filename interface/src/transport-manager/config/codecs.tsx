import { Codec, Message } from '@electricui/core'

import { SystemInfo } from '../../application/typedState'
import { SmartBuffer } from 'smart-buffer'

export class SystemInfoCodec extends Codec<SystemInfo> {
  filter(message: Message): boolean {
    return message.messageID === 'sys'
  }

  encode(payload: SystemInfo) {
    // SmartBuffers automatically keep track of read and write offsets / cursors.
    const packet = new SmartBuffer({ size: 4 })
    packet.writeUInt8(payload.cpu_load)
    packet.writeUInt8(payload.cpu_clock)

    return packet.toBuffer()
  }

  decode(payload: Buffer) {
    const reader = SmartBuffer.fromBuffer(payload)

    const settings: SystemInfo = {
      cpu_load: reader.readUInt8(),
      cpu_clock: reader.readUInt8(),
    }

    return settings
  }
}

export class TaskStatisticsCodec extends Codec {
  filter(message: Message): boolean {
    return message.messageID === 'tasks'
  }

  encode(payload: TaskStatistics): Buffer {
    throw new Error('Battery is read-only')
  }

  decode(payload: Buffer): TaskStatistics[] {
    const reader = SmartBuffer.fromBuffer(payload)

    const taskStats: TaskStatistics[] = []

    while (reader.remaining() > 0) {
      const task: TaskStatistics = {
        id: reader.readUInt8(),
        ready: reader.readUInt8() === 0x01 ? true : false,
        queue_used: reader.readUInt8(),
        queue_max: reader.readUInt8(),
        waiting_max: reader.readUInt32LE(),
        burst_max: reader.readUInt32LE(),
        name: reader.readString(12, 'utf8'),
      }
      taskStats.push(task)
    }

    return taskStats
  }
}

export function splitBufferByLength(toSplit: Buffer, splitLength: number) {
  const chunks = []
  const n = toSplit.length
  let i = 0

  // if the result is only going to be one chunk, just return immediately.
  if (toSplit.length < splitLength) {
    return [toSplit]
  }
  while (i < n) {
    let end = i + splitLength
    chunks.push(toSplit.slice(i, end))
    i = end
  }
  return chunks
}

export class FirmwareInfoCodec extends Codec {
  filter(message: Message): boolean {
    return message.messageID === 'fwb'
  }

  encode(payload: FirmwareBuildInfo): Buffer {
    throw new Error('Firmware/build info is read-only')
  }

  decode(payload: Buffer): FirmwareBuildInfo {
    const chunks = splitBufferByLength(payload, 12)
    const strings = chunks.map(chunk =>
      SmartBuffer.fromBuffer(chunk).readStringNT(),
    )

    return {
      branch: strings[0],
      info: strings[1],
      date: strings[2],
      time: strings[3],
      type: strings[4],
      name: strings[5],
    }
  }
}

// Create the instances of the codecs
export const customCodecs = [
  new SystemInfoCodec(),
  new TaskStatisticsCodec(),
  new FirmwareInfoCodec(),
]
