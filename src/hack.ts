
import { NS } from '@ns';

export const ServerNames: string[] = [
  "n00dles",
  "zer0",
  "foodnstuff",
  "sigma-cosmetics",
  "nectar-net",
  "phantasy",
  "the-hub",
  "summit-uni",
  "johnson-ortho",
  "rothman-uni",
  "I.I.I.I",
  "lexo-corp",
  "alpha-ent",
  "aevum-police",
  "galactic-cyber",
  "omnia",
  "univ-energy",
  "solaris",
  "infocomm",
  "nova-med",
  "zeus-med",
  "zb-def",
  "unitalife",
  "global-pharm",
  "max-hardware",
  "neo-net",
  "joesguns",
  "hong-fang-tea",
  "CSEC",
  "silver-helix",
  "computek",
  "netlink",
  "omega-net",
  "crush-fitness",
  "avmnite-02h",
  "zb-institute",
  "syscore",
  "rho-construction",
  "snap-fitness",
  "deltaone",
  "defcomm",
  "icarus",
  "taiyang-digital",
  "catalyst",
  "millenium-fitness",
  "aerocorp",
  "harakiri-sushi",
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

async function _weaken(ns: NS, server: InternalServer, verbose = false): Promise<number> {
  if (verbose) {
    ns.enableLog("weaken");
  }

  let securityLevel = ns.getServerSecurityLevel(server.name);

  if (securityLevel > server.thresholds.security) {
    ns.print(
      `WARN :: Weaken ${server.name} since current ` +
      `${ns.formatNumber(securityLevel)} > ` +
      `${ns.formatNumber(server.thresholds.security)} threshold.`
    );

    const weakendByAmount = await ns.weaken(server.name);
    securityLevel = ns.getServerSecurityLevel(server.name);
    ns.print(`INFO :: Weakened ${server.name} to ${ns.formatNumber(securityLevel)}`);
  }

  return securityLevel;
}

async function _grow(ns: NS, server: InternalServer, verbose = false): Promise<number> {
  if (verbose) {
    ns.enableLog("grow");
  }

  let moneyAvailable = ns.getServerMoneyAvailable(server.name);

  if (moneyAvailable < server.thresholds.money) {
    ns.print(
      `WARN :: Grow ${server.name} since current ` +
      `$${ns.formatNumber(moneyAvailable)} > ` +
      `$${ns.formatNumber(server.thresholds.money)} threshold.`
    );

    moneyAvailable *= await ns.grow(server.name);
    ns.print(`INFO :: Grew ${server.name} to ${ns.formatNumber(moneyAvailable)}`);
  }

  return moneyAvailable;
}

async function _hack(ns: NS, server: InternalServer, verbose = false): Promise<number> {
  if (verbose) {
    ns.enableLog("hack");
  }

  const hackLevel = ns.getHackingLevel();
  let amountStolen = 0;

  if (hackLevel >= server.thresholds.minHackLevel) {
    amountStolen = await ns.hack(server.name);
    if (amountStolen > 0) {
      ns.print(`INFO :: Stole ${ns.formatNumber(amountStolen)} from ${server.name}`);
    } else {
      ns.print(`ERROR :: Failed to steal from ${server.name}`);
    }
  } else {
    ns.print(
      `WARN :: Cannot hack ${server.name} since current ` +
      `${ns.formatNumber(hackLevel, 0)} < ` +
      `${ns.formatNumber(server.thresholds.minHackLevel, 0)} threshold.`
    );
  }

  return amountStolen;
}

export async function attack(ns: NS, server: InternalServer, verbose = false): Promise<void> {
  await _weaken(ns, server, verbose);
  await _grow(ns, server, verbose);
  await _hack(ns, server, verbose);
}

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("ALL");

  const flags = ns.flags([["verbose", false], ["tail", false]]);

  if (flags.tail as boolean) {
    ns.tail();
    ns.resizeTail(181, 42);
  }

  const targets = ServerNames.map((name) => new InternalServer(ns, name));

  while (true) {
    // TODO: Improve target choice
    for (let i = 0; i < targets.length; i++) {
      if (ns.hasRootAccess(targets[i].name)) {
        await attack(ns, targets[i], flags.verbose as boolean);
      } else {
        ns.print(`WARN :: Cannot attack ${targets[i].name} with no root access.`);
      }
    }
  }
}
