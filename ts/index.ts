import type { ClientReadableStream } from 'grpc-web'
import { SendPromiseClient } from '@hoprnet/hopr-protos/web/send_grpc_web_pb'
import { SendRequest } from '@hoprnet/hopr-protos/web/send_pb'
import { AddressPromiseClient } from '@hoprnet/hopr-protos/web/address_grpc_web_pb'
import { GetHoprAddressRequest } from '@hoprnet/hopr-protos/web/address_pb'
import { ListenPromiseClient } from '@hoprnet/hopr-protos/web/listen_grpc_web_pb'
import { ListenRequest, ListenResponse } from '@hoprnet/hopr-protos/web/listen_pb'
import { Message, IMessage } from './message'
import { API_URL, ROOM } from './env'


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

type PlayersMap = {
  [key:string]: number
}

const start = async () => {
  console.log(`Connecting to ${API_URL}`)

  const hoprAddress = await getHoprAddress()
  console.log(`%c Mazebot HOPR address is ${hoprAddress}`, 'background: #fff; color: #000; font-size: 2em')

  const botAddressElement = document.querySelector('#hopr-bot-address');
  if (botAddressElement) {
    botAddressElement.innerHTML = hoprAddress
  }

  const players: PlayersMap = {};
  const positions: string[] = [];
  const stream = getMessageStream()

  stream
    .on('data', (data) => {
      try {
        const res = new ListenResponse()
        res.setPayload(data.getPayload_asU8())

        const message = new Message(res.getPayload_asU8()).toJson()
        const currentPositionElement = document.querySelector('#current-position');
        const currentPosition = currentPositionElement ? currentPositionElement.innerHTML : 'No position';
        positions.push(currentPosition);
        const moves = players[message.from] || 0;

        console.log(`%c ${message.from} sent ${message.text}`,'background: black; color: #fff; font-size: 2em')

        if(ROOM) {
          const [room, participantMoves] = message.text.split(' ');
          if(`:${ROOM}` === room) {
            switch(participantMoves) {
              case 'U':
              case ':U':
                window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowUp'}));
                break;
              case 'D':
              case ':D':
                window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowDown'}));
                break;
              case 'R':
              case ':R':
                window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowRight'}));
                break;
              case 'L':
              case ':L':
                window.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowLeft'}));
                break;
            }

            const newPositionElement = document.querySelector('#current-position');
            const newPosition = newPositionElement ? newPositionElement.innerHTML : 'No position';

            if (newPosition != currentPosition && !positions.includes(newPosition)) {
              const totalMoves = moves + 1;
              console.log(`%c ${message.from} made a good move! They have done ${totalMoves} so far`, 'background: green; color: #fff; font-size: 2em')
              players[message.from] = totalMoves;

              sendMessage(message.from, {
                from: hoprAddress,
                text: `: ${ROOM} - That was a good move! You have done ${totalMoves} good moves.`,
              })
            } else {
              console.log(`%c ${message.from} made a bad move! They have done ${moves} so far`, 'background: red; color: #fff; font-size: 2em')
              sendMessage(message.from, {
                from: hoprAddress,
                text: `: ${ROOM} - That was a bad move! You have done ${moves} moves.`,
              })
            }     

            console.log(`%c Total Players and Moves: ${JSON.stringify(players)}`, 'background: black; color: #fff; font-size: 2em');
          } else {
            console.log(`Received a message but was for the wrong room (${room}). Current room is ${ROOM}`)
          } 
        } else {
          console.log('No room defined. Mazebot will not work w/o a room.')
        } 
      } catch (err) {
        console.error(err)
      }
    })
    .on('error', (err) => {
      console.error(err)
    })
}

document.addEventListener("DOMContentLoaded", () => {
  start().catch(console.error)
})