/** @param {NS} ns */
import { NS } from '@ns';
import { MANAGING_SERVER, PORT_CRACKER } from 'config/Config';
// import { ServerNames } from 'config/ServerNames';

export const ServerNames: string[] = [
  "n00dles",
  "foodnstuff",
  "CSEC",
  "sigma-cosmetics",
  "joesguns",
  "max-hardware",
  "neo-net",
  "omega-net",
  "computek",
  "hong-fang-tea",
  "zer0",
  "phantasy",
  "harakiri-sushi",
  "nectar-net",
  "silver-helix",
  "the-hub",
  "I.I.I.I",
  "netlink",
  "johnson-ortho",
  "rothman-uni",
  "rho-construction",
  "aerocorp",
  "unitalife",
  "defcomm",
  "taiyang-digital",
  "zb-def",
  "titan-labs",
  "vitalife",
  "microdyne",
  "helios",
  "omnitek",
  "kuai-gong",
  "blade",
  "powerhouse-fitness",
  "crush-fitness",
  "avmnite-02h",
  "zb-institute",
  "lexo-corp",
  "alpha-ent",
  "summit-uni",
  "aevum-police",
  "snap-fitness",
  "millenium-fitness",
  "galactic-cyber",
  "global-pharm",
  "omnia",
  "icarus",
  "univ-energy",
  "solaris",
  "deltaone",
  "zeus-med",
  "infocomm",
  "run4theh111z",
  "stormtech",
  ".",
  "b-and-a",
  "clarkinc",
  "The-Cave",
  "nova-med",
  "applied-energetics",
  "fulcrumtech",
  "4sigma",
  "nwo",
  "ecorp",
  "megacorp",
  "fulcrumassets",
  "syscore",
  "catalyst",
  "iron-gym",
  "darkweb"
];

export class ServerThresholds {
  public readonly money: number;
  public static moneyMultiplier = 0.9;

  public readonly security: number;
  public static securityPadding = 5;

  public readonly minHackLevel: number;

  constructor(money: number, security: number, minHackLevel: number) {
    this.money = money;
    this.security = security;
    this.minHackLevel = minHackLevel;
  }

  public static getThresholds(ns: NS, serverName: string): ServerThresholds {
    const moneyThreshold = ns.getServerMaxMoney(serverName) * ServerThresholds.moneyMultiplier;
    const securityThreshold = ns.getServerMinSecurityLevel(serverName) + ServerThresholds.securityPadding;
    const minHackLevel = ns.getServerRequiredHackingLevel(serverName);

    return new ServerThresholds(moneyThreshold, securityThreshold, minHackLevel);
  }
}

export class InternalServer {
  private ns: NS;
  public readonly name: string;
  public readonly thresholds: ServerThresholds;

  constructor(ns: NS, name: string) {
    this.ns = ns;
    this.name = name;
    this.thresholds = ServerThresholds.getThresholds(ns, name);
  }
}

async function ownTarget(ns: NS, target: string, portOpener: Function[],
  crackers: { file: string; function: any; }[]): Promise<boolean> {
  if (ns.hasRootAccess(target)) {
    return true;
  }
  if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)) {
    const requiredPort = ns.getServerNumPortsRequired(target);
    if (requiredPort <= portOpener.length) {
      let portOpen = 0;
      while (portOpen < requiredPort) {
        try {
          ns.print(`INFO :: Running ${crackers[portOpen].file} on ${target}`);
          portOpener[portOpen](target);
          portOpen++;
        } catch (e) {
          ns.print(`ERROR :: Failed to run ${crackers[portOpen].file} on ${target}.\nException: ${e}`);
          return false;
        }
      }
    } else {
      ns.print(`Not enough port crackers to gain root access to ${target}!`);
      return false;
    }
    ns.nuke(target);

    // // TODO: Figure out how to determine if the singularity API is available
    // try {
    //   ns.singularity.connect(target);
    //   await ns.singularity.installBackdoor();
    // } catch (e) {
    //   ns.print(`ERROR :: Failed to install backdoor on ${target}.\nException: ${e}`);
    // }

    return true;
  }
  else {
    ns.print(`ERROR :: Not enough hacking level to hack ${target}!`);
    return false;
  }
}

async function killRunningScript(ns: NS, scriptPath: string, serverName: string, onKill: (ns: NS, scriptPath: string, serverName: string) => void) {
  if (ns.isRunning(scriptPath, serverName)) {
    ns.scriptKill(scriptPath, serverName);
    await ns.sleep(1000);
  }

  onKill(ns, scriptPath, serverName);
}

function copyScriptToServer(ns: NS, scriptPath: string, serverName: string) {
  if (ns.scp(scriptPath, serverName)) {
    ns.print(`INFO :: Copied ${scriptPath} to ${serverName}`);
  } else {
    ns.tprint(`ERROR :: Failed to copy ${scriptPath} to ${serverName}`);
  }
}

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("ALL");

  const flags = ns.flags([["verbose", false], ["tail", false]]);

  const filePaths = {
    bruteSSH: 'BruteSSH.exe',
    crackFTP: 'FTPCrack.exe',
    hack: 'hack.js'
  };

  if (flags.tail as boolean) {
    ns.tail();
    ns.resizeTail(181, 42);
  }

  const portCrackers = PORT_CRACKER(ns);
  const scriptRam = ns.getScriptRam(filePaths.hack);
  const servers = ServerNames.map((name) => new InternalServer(ns, name));

  for (let i = 0; i < servers.length; ++i) {
    const server = servers[i];
    const opener: Function[] = [];

    for (let i = 0; i < portCrackers.length; i++) {
      if (ns.fileExists(portCrackers[i].file)) {
        opener.push(portCrackers[i].function);
      }
    }

    if (await ownTarget(ns, server.name, opener, portCrackers)) {
      let maxRam = ns.getServerMaxRam(server.name);

      // Is the filePaths.hack script running on the server?
      await killRunningScript(ns, filePaths.hack, server.name, copyScriptToServer);

      if (maxRam >= scriptRam) {
        const usedRam = ns.getServerUsedRam(server.name);
        const threadCount = Math.floor((maxRam - usedRam) / scriptRam);
        // Run script on server
        ns.exec(filePaths.hack, server.name, threadCount);
        ns.print(`INFO :: Running ${filePaths.hack} on ${server.name} with ${threadCount} threads.`);
      } else {
        ns.print(`WARN :: Not enough RAM to run ${filePaths.hack} on ${server.name}`);
      }
    }
  }

  if (ns.isRunning(filePaths.hack, MANAGING_SERVER)) {
    ns.scriptKill(filePaths.hack, MANAGING_SERVER);
    await ns.sleep(1000);
  }

  let maxRam = ns.getServerMaxRam(MANAGING_SERVER);
  if (maxRam >= scriptRam) {
    const usedRam = ns.getServerUsedRam(MANAGING_SERVER);
    const threadCount = Math.floor((maxRam - usedRam) / scriptRam) - 4;
    // Run script on server
    ns.exec(filePaths.hack, MANAGING_SERVER, threadCount);
    ns.print(`INFO :: Running ${filePaths.hack} on ${MANAGING_SERVER} with ${threadCount} threads.`);
  } else {
    ns.print(`WARN :: Not enough RAM to run ${filePaths.hack} on ${MANAGING_SERVER}`);
  }
}
