
export const DEBUG = true;

import { HackMode, HackType, RequiredScript } from "managers/hackManager/enum";
import { Action, ChannelName } from "managers/messageManager/enum";
import { Message } from "managers/messageManager/class";

export const MANAGING_SERVER: string = "home";
export const HACKING_SERVER: string = "home";
export const THREAD_SERVER: string = "home";
export const BASE_DIR: string = "/Orchestrator/";

export const HACKING_SCRIPTS: Record<RequiredScript, string> = {
  [RequiredScript.hack]: "/managers/hackManager/script/hack.js",
  [RequiredScript.weaken]: "/managers/hackManager/script/weaken.js",
  [RequiredScript.grow]: "/managers/hackManager/script/grow.js",
  [RequiredScript.xp]: "/managers/hackManager/script/xp.js",
};

export const SHARING_SCRIPT: string = "/managers/threadManager/script/share.js";

export const MANAGER_SCRIPTS: Partial<Record<ChannelName, { script: string; server: string; }>> = {
  [ChannelName.messageManager]: {
    script: "/managers/messageManager/manager.js",
    server: MANAGING_SERVER
  },
  [ChannelName.threadManager]: {
    script: "/managers/threadManager/manager.js",
    server: THREAD_SERVER
  },
  [ChannelName.hackManager]: {
    script: "/managers/hackManager/manager.js",
    server: MANAGING_SERVER
  },
  [ChannelName.targetManager]: {
    script: "/managers/targetManager/manager.js",
    server: MANAGING_SERVER
  },
  [ChannelName.serverManager]: {
    script: "/managers/serverManager/manager.js",
    server: MANAGING_SERVER
  }
};

export const HACKING_CONDUCTOR: Record<HackType, string> = {
  [HackType.growWeakenHack]: "/managers/hackManager/conductor/GrowWeakenConductor.js",
  [HackType.moneyHack]: "/managers/hackManager/conductor/MoneyHackConductor.js",
  [HackType.xpHack]: "/managers/hackManager/conductor/XpHackConductor.js",
};

export const HACK_MODE: Record<HackMode, HackType[]> = {
  [HackMode.money]: [HackType.moneyHack, HackType.growWeakenHack],
  [HackMode.xp]: [HackType.xpHack]
};

export const IMPORT_TO_COPY: string[] = [
  "/managers/messageManager/class.js",
  "/managers/messageManager/enum.js",
  "/Orchestrator/Common/Dprint.js",
  "/Orchestrator/Config/Debug.js",
  "/managers/hackManager/enum.js",
  SHARING_SCRIPT
];

export const DEFAULT_HACKING_MODE: HackMode = HackMode.money;

export const HACK_TYPE_PARTIAL_THREAD: HackType[] = [HackType.growWeakenHack];

export const SERVER_INITIAL_RAM: number = 8;

export const BOOT_SCRIPTS: string[] = [
  ChannelName.messageManager,
  ChannelName.threadManager,
  ChannelName.hackManager,
  ChannelName.targetManager,
  ChannelName.serverManager
];

export const KILL_MESSAGE: (m: Message) => boolean = m => m.payload.action === Action.kill;

export const PORT_CRACKER = (ns) => [
  { file: "BruteSSH.exe", function: ns.brutessh },
  { file: "FTPCrack.exe", function: ns.ftpcrack },
  { file: "relaySMTP.exe", function: ns.relaysmtp },
  { file: "HTTPWorm.exe", function: ns.httpworm },
  { file: "SQLInject.exe", function: ns.sqlinject },
];

export const MIN_HACK_CHANCE: number = 0.5;

export const MIN_SERVER_FOR_UPDATE: number = 1;

export const MAX_SERVER_RAM: number = -1;

export const MONEY_HACKING_TARGET_PERCENT: number = 0.95;

export const USE_LOGISTIC_PROBABILITY: boolean = true;

// 3 minutes seems to be the sweet spot for the timeout threshold
export const TIMEOUT_THRESHOLD: number = 180 * 1000;

export const USE_SHARE: boolean = true;
