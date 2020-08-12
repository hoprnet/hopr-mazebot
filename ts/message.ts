// @TODO: Replace deprecated and large text-encoding library
import encoding from 'text-encoding';
import { u8aConcat } from './u8aConcat'

const textEncoder = new encoding.TextEncoder()
const textDecoder = new encoding.TextDecoder()

export type IMessage = {
  from: string
  text: string
}

export class Message extends Uint8Array {
  subarray(begin: number, end?: number): Uint8Array {
    return new Uint8Array(this.buffer, begin + this.byteOffset, end != null ? end - begin : undefined)
  }

  toU8a(): Uint8Array {
    return new Uint8Array(this)
  }

  toJson(): IMessage {
    try {
      const from = this.subarray(0, 53)
      const text = this.subarray(53, this.length)

      return {
        from: textDecoder.decode(from),
        text: textDecoder.decode(text),
      }
    } catch (err) {
      console.error(err)
      throw Error('Unable to decode message')
    }
  }

  static fromJson(message: IMessage): Message {
    const from = textEncoder.encode(message.from)
    const text = textEncoder.encode(message.text)

    return new Message(u8aConcat(from, text))
  }
}