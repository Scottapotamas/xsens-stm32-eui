import { Codec, Message } from '@electricui/core'

import {
  SystemInfo,
  TaskStatistics,
  FirmwareBuildInfo,
  IMUStatus,
  PoseConverted,
} from '../../application/typedState'
import { SmartBuffer } from 'smart-buffer'

import { Pack, Unpack, BitFieldObject } from '@electricui/utility-bitfields'

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

const bitFieldOrder = [
  'reserved_0',
  'clock_bias_estimation',
  'representitive_motion',
  'no_rotation_status_1',
  'no_rotation_status_0',
  'gnss_fix',
  'filter_valid',
  'self_test', // lowest bit

  'clip_mag_y',
  'clip_mag_x',
  'clip_gyro_z',
  'clip_gyro_y',
  'clip_gyro_x',
  'clip_acc_z',
  'clip_acc_y',
  'clip_acc_x',

  'filter_mode_0',
  'sync_out_mark',
  'sync_in_mark',
  'reserved_3',
  'clipping',
  'reserved_2',
  'reserved_1',
  'clip_mag_z',

  'reserved_6', // highest bit
  'reserved_5',
  'reserved_4',
  'rtk_status_1',
  'rtk_status_0',
  'has_gnss_pulse',
  'filter_mode_2',
  'filter_mode_1',
]

// const bitFieldOrder = [
//   'self_test', // lowest bit
//   'filter_valid',
//   'gnss_fix',
//   'no_rotation_status_0',
//   'no_rotation_status_1',
//   'representitive_motion',
//   'clock_bias_estimation',
//   'reserved_0',
//   'clip_acc_x',
//   'clip_acc_y',
//   'clip_acc_z',
//   'clip_gyro_x',
//   'clip_gyro_y',
//   'clip_gyro_z',
//   'clip_mag_x',
//   'clip_mag_y',
//   'clip_mag_z',
//   'reserved_1',
//   'reserved_2',
//   'reserved_3',
//   'reserved_4',
//   'clipping',
//   'reserved_5',
//   'sync_in_mark',
//   'sync_out_mark',
//   'filter_mode_0',
//   'filter_mode_1',
//   'filter_mode_2',
//   'has_gnss_pulse',
//   'rtk_status_0',
//   'rtk_status_1',
//   'reserved_6',
//   'reserved_7',
//   'reserved_8', // highest bit
// ]

export class IMUStatusCodec extends Codec<IMUStatus> {
  filter(message: Message): boolean {
    return message.messageID === 'ok'
  }

  encode(payload: IMUStatus): Buffer {
    throw new Error('IMU Status word bits are read-only')
  }

  decode(payload: Buffer): IMUStatus {
    return Unpack(payload, bitFieldOrder)
  }
}

function convert_quaternion_to_euler(quat: number[]): number[] {
  let euler: number[] = [0, 0, 0]

  const w: number = quat[0]
  const x: number = quat[1]
  const y: number = quat[2]
  const z: number = quat[3]

  const sinr_cosp: number = 2 * (w * x + y * z)
  const cosr_cosp: number = 1 - 2 * (x * x + y * y)

  // Roll
  euler[0] = Math.atan2(sinr_cosp, cosr_cosp)

  // Pitch: y-axis
  const sinp: number = 2 * (w * y - z * x)

  if (Math.abs(sinp) >= 1) {
    euler[1] = (Math.PI / 2) * Math.sign(sinp) // use 90 degrees if out of range
  } else {
    euler[1] = Math.asin(sinp)
  }

  // Yaw: z-axis
  const siny_cosp: number = 2 * (w * z + x * y)
  const cosy_cosp: number = 1 - 2 * (y * y + z * z)
  euler[2] = Math.atan2(siny_cosp, cosy_cosp)

  return euler
}

export class PoseConversionCodec extends Codec {
  filter(message: Message): boolean {
    return message.messageID === 'quat'
  }

  encode(payload: PoseConverted): Buffer {
    throw new Error('quat info is read-only')
  }

  decode(payload: Buffer): PoseConverted {
    const reader = SmartBuffer.fromBuffer(payload)

    const quaternion: number[] = []

    quaternion[0] = reader.readFloatLE()
    quaternion[1] = reader.readFloatLE()
    quaternion[2] = reader.readFloatLE()
    quaternion[3] = reader.readFloatLE()

    const euler: number[] = convert_quaternion_to_euler(quaternion)

    const pose: PoseConverted = {
      q0: quaternion[0],
      q1: quaternion[1],
      q2: quaternion[2],
      q3: quaternion[3],
      pitch: euler[1] * (180 / Math.PI),
      roll: euler[0] * (180 / Math.PI),
      heading: euler[2] * (180 / Math.PI),
    }

    return pose
  }
}

// Create the instances of the codecs
export const customCodecs = [
  new SystemInfoCodec(),
  new TaskStatisticsCodec(),
  new FirmwareInfoCodec(),
  new IMUStatusCodec(),
  new PoseConversionCodec(),
]
