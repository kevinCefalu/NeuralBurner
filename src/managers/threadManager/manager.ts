/** @param {NS} ns */
import { NS } from '@ns'
import { Message, MessageActions, MessageHandler, Payload, } from "manager/messageManager/class";
import { Action, ChannelName } from "manager/messageManager/enum";
import {
  HACKING_SCRIPTS,
  HACKING_SERVER,
  MANAGING_SERVER, SHARING_SCRIPT,
  THREAD_SERVER,
  TIMEOUT_THRESHOLD, USE_SHARE, DEBUG
} from "config/Config";

export class Thread {
  host: string;
  inUse: boolean;
  locked: boolean;
  expectedRelease: number | null;

  constructor(host: string, inUse: boolean) {
    this.host = host;
    this.inUse = inUse;
    this.locked = false;
    this.expectedRelease = null;
  }
}

export type ThreadsList = Record<string, number>

export async function main(ns : NS) : Promise<void> {
  ns.disableLog('sleep');
  ns.disableLog('getScriptRam');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('exec');

  const mySelf: ChannelName = ChannelName.threadManager;
  let threads: Thread[] = [];
  let killrequest: boolean = false;
  let lockedHost: string[] = [];
  let useShare: boolean = USE_SHARE;

  const messageActions: MessageActions = {
    [Action.getThreads]: getThreads,
    [Action.getThreadsAvailable]: getAvailableThreads,
    [Action.addHost]: addHost,
    [Action.freeThreads]: freeThreads,
    [Action.updateHost]: updateHost,
    [Action.kill]: kill,
    [Action.consoleThreadsUse]: consoleThreadsUse,
    [Action.lockHost]: lockHost,
    [Action.getTotalThreads]: getTotalThreads,
    [Action.useShareSwitch]: useShareSwitch,
  };
  const messageHandler: MessageHandler = new MessageHandler(ns, mySelf);

  const ramChunk = Math.max(...Object.values(HACKING_SCRIPTS).map(script => ns.getScriptRam(script)));
  const shareChunk = ns.getScriptRam(SHARING_SCRIPT);
  while (true) {
    if (killrequest) break;
    const lastMessage: Message[] = await messageHandler.popLastMessage();
    lastMessage.length > 0 && await messageActions[lastMessage[0].payload.action]?.(lastMessage[0]);
    //cleanup()
    await ns.sleep(100);
  }

  // TODO: dprint(ns, "Exiting");

  function cleanup() {
    let orphanThreads = 0;
    for (let i = 0; i < threads.length; i++) {
      const threadIndex = threads.findIndex(t => (t.inUse && (t.expectedRelease && t.expectedRelease < Date.now())));
      if (threadIndex === -1) return;
      threads[threadIndex].inUse = false;
      threads[threadIndex].expectedRelease = null;
      orphanThreads++;
    }
    DEBUG && ns.tprint("Cleaned up " + orphanThreads + " orphan threads.");
  }

  async function useShareSwitch(message: Message) {
    useShare = !useShare;
    const hosts: string[] = [...new Set(threads.map(thread => thread.host))];
    for (const host of hosts) {
      killAndRestartShare(host);
    }
  }

  function killAndRestartShare(host: string) {
    const nbOfThreadsInUse: number = threads.filter(t => (t.host === host && t.inUse)).length;
    const nbOfShareThreads: number = Math.floor((ns.getServerMaxRam(host) - (nbOfThreadsInUse * ramChunk)) / shareChunk);
    ns.kill(SHARING_SCRIPT, host);
    if (!lockedHost.includes(host) && nbOfShareThreads > 0 && useShare) {
      ns.exec(SHARING_SCRIPT, host, nbOfShareThreads);
    }
  }

  async function addHost(message: Message) {
    const host: string = message.payload.info as string;
    const hosts: string[] = [...new Set(threads.map(thread => thread.host))];
    // If the host is the one from which the Hack emanate we skip it
    if (host === HACKING_SERVER || host === MANAGING_SERVER || host === THREAD_SERVER) return;
    if (hosts.includes(host)) await updateHost(message);
    const hostThreads: number = Math.floor(((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ramChunk));
    // TODO: dprint(ns, "Got new host: " + host + " with " + hostThreads + " threads");
    for (let j = 0; j < hostThreads; j++) threads.push(new Thread(host, false));
    useShare && killAndRestartShare(host);
  }

  async function getTotalThreads(message: Message) {
    const payload: Payload = new Payload(Action.totalThreads, threads.filter(t => !t.locked).length);
    await messageHandler.sendMessage(message.origin, payload, message.originId);
  }

  async function getAvailableThreads(message: Message) {
    //// TODO: dprint(ns, "Got thread request from: " + message.origin + " for available threads")
    let payload = new Payload(Action.threadsAvailable, 0);
    if (threads.length) {
      let availableThreads = threads.filter(thread => (!thread.inUse && !thread.locked)).length;
      payload = new Payload(Action.threadsAvailable, availableThreads);
    }
    await messageHandler.sendMessage(message.origin, payload, message.originId);
  }

  async function getThreads(message: Message) {
    let number: number | string = message.payload.info as number;
    const exact: boolean = message.payload.extra?.['exact'] || false;
    const expectedTime: number | null = message.payload.extra?.['time'] || null;
    if (threads.length === 0) {
      // TODO: dprint(ns, "Thread manager not ready.");
      await messageHandler.sendMessage(message.origin, new Payload(Action.threads, {}), message.originId);
      return;
    }
    const unusedThreads: Thread[] = threads.filter(thread => (!thread.inUse && !thread.locked));

    // TODO: dprint(ns, "Got thread request from: " + message.originId + " for " + number + " threads (Exact: " + exact + ")");
    // -1 will return all available threads [Deprecated]
    if (number === -1) {
      number = unusedThreads.length as number;
    }

    if (unusedThreads.length < number && exact) {
      // TODO: dprint(ns, "Not enough threads");
      await messageHandler.sendMessage(message.origin, new Payload(Action.threads, {}), message.originId);
      return;
    }

    const allocatedThreads: Thread[] = unusedThreads.slice(0, number);
    allocatedThreads.map(thread => {
      thread.inUse = true;
      if (expectedTime) thread.expectedRelease = Date.now() + expectedTime + TIMEOUT_THRESHOLD;
    });

    const uniqueHost: string[] = [...new Set(allocatedThreads.map(thread => thread.host))];
    const allocatedThreadsByHost: ThreadsList = uniqueHost.reduce((acc, cur) => {
      acc[cur] = allocatedThreads.filter(t => t.host == cur).length;
      return acc;
    }, {});
    if (useShare) {
      for (const host of Object.keys(allocatedThreadsByHost)) {
        killAndRestartShare(host);
      }
    }
    // TODO: dprint(ns, "Allocated " + allocatedThreads.length + " threads to hack " + message.originId);
    await messageHandler.sendMessage(message.origin, new Payload(Action.threads, allocatedThreadsByHost), message.originId);
  }

  async function freeThreads(message) {
    // TODO: dprint(ns, "Received thread freeing request from " + message.origin + "(Origin ID: " + message.originId + ")");
    const threadsInfo: ThreadsList = message.payload.info;
    for (const host of Object.keys(threadsInfo)) {
      const usedThreadFilter = t => (t.inUse && t.host === host);
      const usedThreads = threads.filter(usedThreadFilter); // We filter the used threads for the host
      threads = threads.filter(t => !usedThreadFilter(t)); // We remove those thread from the current pool
      const threadsToRelease = usedThreads.splice(0, threadsInfo[host]); // We remove the thread that we want to release
      threads.push(...usedThreads); // We read the still used threads in the pool
      const releasedThreads = threadsToRelease.map(t => {
        const thread = new Thread(t.host, false);
        thread.locked = t.locked;
        return thread;
      });
      threads.push(...releasedThreads);

      // for (let i = 0; i < threadsInfo[host]; i++) {
      //     const threadIndex = threads.findIndex(t => (t.inUse && t.host === host))
      //     if (threadIndex>=0) {
      //         threads[threadIndex].inUse = false
      //         threads[threadIndex].expectedRelease = null
      //     }
      // }
      // TODO: dprint(ns, "Deallocated " + threadsInfo[host] + " threads of " + host);
      useShare && killAndRestartShare(host);
      await checkLockedStatus(host);
      await ns.sleep(100); // Throttle
    }
  }

  async function checkLockedStatus(hostname: string) {
    const hostThreads: Thread[] = threads.filter(t => (t.host === hostname));
    if (lockedHost.includes(hostname) && !hostThreads.some(t => t.inUse)) {
      await messageHandler.sendMessage(ChannelName.serverManager, new Payload(Action.hostLocked, hostname));
    }
  }

  async function updateHost(message) {
    // TODO: dprint(ns, "Updating threads amount on " + message.payload.info);
    const host: string = message.payload.info;
    lockedHost = lockedHost.filter(h => h !== message.payload.info);
    threads = threads.filter(t => t.host !== host);
    await addHost(message);
  }

  async function kill() {
    // TODO: dprint(ns, "Kill request. Kill all threads");
    const usedThreads: Thread[] = threads.filter(t => t.inUse = true);
    const uniqueHost: string[] = [...new Set(usedThreads.map(thread => thread.host))];
    for (const host of uniqueHost) {
      ns.killall(host);
    }
    killrequest = true;
  }

  async function consoleThreadsUse(message: Message) {
    for (const host of [...new Set(threads.map(thread => thread.host))]) {
      const hostUsedRam: number = ns.getServerUsedRam(host);
      const hostMaxRam: number = ns.getServerMaxRam(host);
      const hostThreads: Thread[] = threads.filter(t => t.host === host);
      const hostThreadsInUse: Thread[] = hostThreads.filter(t => t.inUse);
      const numberOfBar: number = hostThreads.length ? Math.round((hostThreadsInUse.length / hostThreads.length * 20)) : 20;
      const numberOfDash: number = 20 - numberOfBar;
      const padding: number = 20 - host.length;
      const barSymbol: string = lockedHost.includes(host) ? "X" : "|";
      const dashSymbol: string = lockedHost.includes(host) ? "*" : "-";
      ns.tprint(host + " ".repeat(padding) + ": [" + barSymbol.repeat(numberOfBar) + dashSymbol.repeat(numberOfDash) + "] (" + hostThreadsInUse.length + "/" + hostThreads.length + ")  " + hostUsedRam + " GiB/" + hostMaxRam + " GiB");
    }
  }

  async function lockHost(message: Message) {
    const host: string = message.payload.info as string;
    lockedHost.push(host);
    useShare && killAndRestartShare(host);
    for (const thread of threads) if (thread.host === host) thread.locked = true;
    await checkLockedStatus(host);
  }
}
