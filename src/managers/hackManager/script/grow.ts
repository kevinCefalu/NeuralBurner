import { NS } from '@ns'
// import { MessageHandler, Payload } from "/Orchestrator/MessageManager/class";
// import { Action, ChannelName } from "/Orchestrator/MessageManager/enum";

/** @param {NS} ns */
export async function main(ns : NS) : Promise<void> {
  ns.disableLog("sleep");

  // const mySelf: ChannelName = ChannelName.hackScript;

  const target: string = ns.args[0] as string;
  const originId: number = ns.args[1] as number;

  // const messageHandler: MessageHandler = new MessageHandler(ns, mySelf);
  const results: number = await ns.grow(target);

  // await messageHandler.sendMessage(
  //   ChannelName.hackConductor,
  //   new Payload(Action.growScriptDone, results),
  //   originId
  // );
}
