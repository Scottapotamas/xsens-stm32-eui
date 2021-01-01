/**
 * To strictly type all accessors and writers, remove
 *
 * [messageID: string]: any
 *
 * And replace with your entire state shape after codecs have decoded them.
 */
declare global {
  interface ElectricUIDeveloperState {
    [messageID: string]: any

    // Example messageID typings
    led_blink: number
    led_state: number
    lit_time: number
  }
}

// Export custom struct types for use in both codecs and the application
export type LEDSettings = {
  glow_time: number
  enable: number
}


export type SystemInfo = {
  cpu_load: number
  cpu_clock: number
}

export type TaskStatistics = {
  id: number
  ready: boolean
  queue_used: number
  queue_max: number
  waiting_max: number
  burst_max: number
  name: string
}

export type FirmwareBuildInfo = {
  branch: string
  info: string
  date: string
  time: string
  type: string
  name: string
}

// This exports these types into the dependency tree.
export {}
