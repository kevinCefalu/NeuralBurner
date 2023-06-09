import { NS } from '@ns';

import {
  DEBUG,
  BASE_DIR,
  BOOT_SCRIPTS,
  HACKING_SCRIPTS,
  IMPORT_TO_COPY,
  MANAGER_SCRIPTS,
  MANAGING_SERVER,
  HACKING_SERVER,
  THREAD_SERVER
} from 'configs/Config';
import { Action, ChannelName } from "manager/messageManager/enum";
import { MessageHandler, Payload } from "manager/messageManager/class";
import { copyFile } from "common/FileIO";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const option: string = ns.args[0] as string;
  let scriptList: string[] = BOOT_SCRIPTS

  const messageHandler: MessageHandler = new MessageHandler(ns, ChannelName.bootScript);

  if (option === "no-server-manager") {
    scriptList = scriptList.filter(s => s !== ChannelName.serverManager);
  }

  // TODO: Create server roles
  // if (MANAGING_SERVER !== "home") {
  //   await ns.scp(ns.ls("home", BASE_DIR), "home", MANAGING_SERVER);
  //   ns.tprint("Copying " + ns.ls("home", BASE_DIR).length + " files to " + MANAGING_SERVER);
  // }

  // if (HACKING_SERVER !== "home") {
  //   await ns.scp(ns.ls("home", BASE_DIR), "home", HACKING_SERVER);
  //   ns.tprint("Copying " + ns.ls("home", BASE_DIR).length + " files to " + HACKING_SERVER);
  // }

  // if (THREAD_SERVER !== "home") {
  //   await ns.scp(ns.ls("home", BASE_DIR), "home", THREAD_SERVER);
  //   ns.tprint("Copying " + ns.ls("home", BASE_DIR).length + " files to " + THREAD_SERVER);
  // }

  for (const script of scriptList) {
    DEBUG && ns.tprint("Starting " + script);
    ns.exec(MANAGER_SCRIPTS[script].script, MANAGER_SCRIPTS[script].server);
    await ns.sleep(1000);
  }

  for (const server of ns.getPurchasedServers()) {
    await messageHandler.sendMessage(ChannelName.threadManager, new Payload(Action.updateHost, server));
    await copyFile(ns, Object.values(HACKING_SCRIPTS), server);
    await copyFile(ns, IMPORT_TO_COPY, server);
  }

}
