/** @param {NS} ns */
import { NS } from '@ns';
import { Message, NULL_PORT_DATA, Payload } from "managers/MessageManager/class";
import { Action, ChannelName } from "managers/MessageManager/enum";
// import { dprint } from "/Orchestrator/Common/Dprint";
var eval2 = eval;
export async function main(ns: NS): Promise<void> {
  ns.disableLog('sleep');

  emptyPorts();

  let messageQueue: Message[] = [];
  while (true) {
    await receiveMessage();
    await checkMessageRequest();
    await checkConsoleCall();
    await checkClearMessage();
    await ns.sleep(10);
  }

  async function checkConsoleCall() {
    const dumpQueue: Message[] = extractMessage(m => m.payload.action === Action.dumpQueue);
    if (dumpQueue.length > 0) {
      for (const message of messageQueue) {
        ns.tprint("From: " + message.origin + ":" + message.originId + " -> To:" + message.destination + ":" + message.destinationId + " > Payload: " + JSON.stringify(message.payload));
      }
    }
  }

  async function checkClearMessage() {
    const messages: Message[] = extractMessage(m => m.payload.action === Action.clearMyMessage);
    for (const message of messages) {
      messageQueue = messageQueue.filter(m => m.destinationId !== message.originId && m.destination !== message.origin);
    }
  }

  function extractMessage(filter: (m) => boolean): Message[] {
    const extractedMessage: Message[] = messageQueue.filter(filter);
    messageQueue = messageQueue.filter(m => !filter(m));
    return extractedMessage;
  }

  async function checkMessageRequest() {
    const requests: Message[] = extractMessage(m => m.payload.action === Action.messageRequest);
    for (const request of requests) {
      const port: number = request.comPort;
      const requesterFilter: (m: Message) => boolean = (m) => (m.destination === request.origin && m.destinationId === request.originId);

      let extraFilter: (m: Message) => boolean = (m) => true;
      if (request.payload.info) {
        extraFilter = eval2(request.payload.info as string);
      }
      const messageForRequester: Message[] = extractMessage(requesterFilter);
      const messageToSend: Message[] = messageForRequester.filter(extraFilter);
      const messageToKeep: Message[] = messageForRequester.filter(m => !extraFilter(m));
      messageQueue.push(...messageToKeep);
      if (messageToSend.length > 0) {
        await dispatchMessage(messageToSend, port);
      }
      await dispatchMessage([new Message(request.comPort, ChannelName.messageManager, request.origin, new Payload(Action.noMessage), null, request.originId)], port);
    }
  }

  async function dispatchMessage(messageToSend: Message[], port: number) {

    for (const message of messageToSend) {
      message.dispatchedTime = Date.now();
      message.comPort = port;
      const writtenMessage = await ns.tryWritePort(
        message.comPort,
        message.string
      );
      if (!writtenMessage) {
        // TODO: dprint(ns, "Sending failed: " + message.destination + ":" + message.destinationId + "(Port: " + message.comPort + "). Readded to queue.");
        messageQueue.push(message);
      }
    }
  }

  async function receiveMessage() {
    for (let port = 1; port < 21; port++) {
      const response: string = ns.peek(port);
      if (response !== NULL_PORT_DATA) {
        let parsedResponse: Message = Message.fromJSON(response);
        // If the message has been on top of the port queue for more than 1 second we push it at the back of the queue
        if (parsedResponse.dispatchedTime && (Date.now() - parsedResponse.dispatchedTime) > 1000) {
          if ((Date.now() - parsedResponse.dispatchedTime) > 1000) {
            ns.readPort(port);
            await dispatchMessage([parsedResponse], parsedResponse.comPort);
            // TODO: dprint(ns, "Stale to: " + parsedResponse.destination + ":" + parsedResponse.destinationId + " Action: " + parsedResponse.payload.action);
          } else if ((Date.now() - parsedResponse.dispatchedTime) > 60000) {
            ns.readPort(port);
            // TODO: dprint(ns, "Discarded to: " + parsedResponse.destination + ":" + parsedResponse.destinationId + " Action: " + parsedResponse.payload.action);
          }
          // If the message has never been dispatched we read it
        } else if (!parsedResponse.dispatchedTime) {
          ns.readPort(port);
          messageQueue.push(parsedResponse);
        }
      }
    }
  }

  function emptyPorts() {
    for (let port = 1; port < 21; port++) {
      while (true) {
        if (ns.readPort(port) === NULL_PORT_DATA) {
          break;
        }
      }
    }
  }
}
