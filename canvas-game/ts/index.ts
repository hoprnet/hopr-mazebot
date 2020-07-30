import type { ClientReadableStream } from 'grpc-web'
import { SendPromiseClient } from '@hoprnet/hopr-protos/web/send_grpc_web_pb'
import { SendRequest } from '@hoprnet/hopr-protos/web/send_pb'
import { AddressPromiseClient } from '@hoprnet/hopr-protos/web/address_grpc_web_pb'
import { GetHoprAddressRequest } from '@hoprnet/hopr-protos/web/address_pb'
import { ListenPromiseClient } from '@hoprnet/hopr-protos/web/listen_grpc_web_pb'
import { ListenRequest, ListenResponse } from '@hoprnet/hopr-protos/web/listen_pb'
import { Message, IMessage } from './message'
import { generateRandomSentence } from './utils'
import { API_URL } from './env'


const getHoprAddress = (): Promise<string> => {
  console.log('Getting HOPR Address', AddressPromiseClient)

  return new AddressPromiseClient(API_URL).getHoprAddress(new GetHoprAddressRequest()).then(res => {
    return res.getAddress()
  })
}

const sendMessage = (recepientAddress: string, message: IMessage): Promise<void> => {
  const client = new SendPromiseClient(API_URL)
  
  const req = new SendRequest()
  req.setPeerId(recepientAddress)
  req.setPayload(Message.fromJson(message).toU8a())

  return client.send(req).then(() => {
    console.log(`-> ${recepientAddress}: ${message.text}`)
  })
}

const getMessageStream = (): ClientReadableStream<ListenResponse> => {
  return new ListenPromiseClient(API_URL).listen(new ListenRequest())
}

const start = async () => {
  console.log(`Connecting to ${API_URL}`)

  const hoprAddress = await getHoprAddress()
  console.log(`My HOPR address is ${hoprAddress}`)

  const stream = getMessageStream()

  stream
    .on('data', (data) => {
      try {
        const res = new ListenResponse()
        res.setPayload(data.getPayload_asU8())

        const message = new Message(res.getPayload_asU8()).toJson()
        console.log(`<- ${message.from}: ${message.text}`)

        console.log('Message', message.text)

        switch(message.text) {
          case 'U':
            window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowUp'}));
            break;
          case 'D':
            window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowDown'}));
            break;
          case 'R':
            console.log('Sending stuff up right')
            window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowRight'}));
            break;
          case 'L':
            window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowLeft'}));
            break;
        }

        sendMessage(message.from, {
          from: hoprAddress,
          text: `: Hello ${generateRandomSentence()}`,
        })
      } catch (err) {
        console.error(err)
      }
    })
    .on('error', (err) => {
      console.error(err)
    })
}

start().catch(console.error)