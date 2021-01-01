import { Codec, Message } from '@electricui/core'

import { LEDSettings } from '../../application/typedState'
import { SmartBuffer } from 'smart-buffer'

/**
 * If you are following the hello-blink example, structure use needs to be added.
 * Follow the getting started tutorial for UI development for notes.
 */
export class LEDCodec extends Codec<LEDSettings> {
  filter(message: Message): boolean {
    return message.messageID === 'led'
  }

  encode(payload: LEDSettings) {
    // SmartBuffers automatically keep track of read and write offsets / cursors.
    const packet = new SmartBuffer({ size: 4 })
    packet.writeUInt16LE(payload.glow_time)
    packet.writeUInt8(payload.enable)

    return packet.toBuffer()
  }

  decode(payload: Buffer) {
    const reader = SmartBuffer.fromBuffer(payload)

    const settings: LEDSettings = {
      glow_time: reader.readUInt16LE(),
      enable: reader.readUInt8(),
    }

    return settings
  }
}

// Create the instances of the codecs
export const customCodecs = [
  new LEDCodec(), // An instance of the LEDSettings Codec
]
