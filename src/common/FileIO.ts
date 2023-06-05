/** @param {NS} ns */
import { NS } from '@ns'
import { ThreadsList } from "managers/threadManager/manager";
import { Action, ChannelName } from "managers/messageManager/enum";
import { Message, MessageHandler, Payload } from "managers/messageManager/class";
import { KILL_MESSAGE } from "config/Config";
import { Hack } from "managers/HackManager/hack";
import { freeThreads } from "managers/threadManager/common";

export async function copyFile(ns: NS, fileList: string[], host) {
  for (let j = 0; j < fileList.length; j++) {
    const script: string = fileList[j];
    ns.fileExists(script, host) && ns.rm(script, host);
    await ns.scp(script, "home", host);
  }
}

export async function executeScript(ns: NS, script: string, threads: ThreadsList, hack: Hack, messageHandler: MessageHandler, id: number): Promise<number> {
  // TODO: dprint(ns, "Executing scripts: " + script);
  let executedScript = 0;

  for (const host of Object.keys(threads)) {
    if (threads[host] === 0) continue;

    const pid = ns.exec(script, host, threads[host], hack.host, id, executedScript);

    if (pid > 0) {
      executedScript++;
    } else {
      // TODO: dprint(ns, "Hack " + id + " targeting " + hack.host + " could not start script on " + host + " with " + threads[host] + " threads.");
      await freeThreads(ns, { [host]: threads[host] }, messageHandler);
    }
  }

  return executedScript;
}

export async function checkForKill(ns: NS, messageHandler: MessageHandler): Promise<boolean> {
  const killMessage: Message[] = await messageHandler.getMessagesInQueue(KILL_MESSAGE);

  if (killMessage.length > 0) {
    // TODO: dprint(ns, "Kill request");
    await messageHandler.sendMessage(ChannelName.hackManager, new Payload(Action.hackDone, "Killed"));

    return true;
  }

  return false;
}
