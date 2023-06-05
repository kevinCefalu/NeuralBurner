/** @param {NS} ns */
import { NS } from '@ns';

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

async function _weaken(ns: NS, server: InternalServer, verbose = false): Promise<number> {
  if (verbose) ns.enableLog("weaken");

  let securityLevel = ns.getServerSecurityLevel(server.name);

  if (securityLevel > server.thresholds.security) {
    verbose && ns.print(
      `WARN :: Weaken ${server.name} since current ` +
      `${ns.formatNumber(securityLevel)} > ` +
      `${ns.formatNumber(server.thresholds.security)} threshold.`
    );

    const weakendByAmount = await ns.weaken(server.name);
    ns.print(`INFO :: Weakened ${server.name} by ${ns.formatNumber(weakendByAmount)}.`);
  }

  return securityLevel;
}

async function _grow(ns: NS, server: InternalServer, verbose = false): Promise<number> {
  if (verbose) ns.enableLog("grow");

  let moneyAvailable = ns.getServerMoneyAvailable(server.name);

  if (moneyAvailable < server.thresholds.money) {
    verbose && ns.print(
      `WARN :: Grow ${server.name} since current ` +
      `$${ns.formatNumber(moneyAvailable)} > ` +
      `$${ns.formatNumber(server.thresholds.money)} threshold.`
    );

    moneyAvailable *= await ns.grow(server.name);
    moneyAvailable = ns.getServerMoneyAvailable(server.name);
    ns.print(`INFO :: Grew ${server.name} to ${ns.formatNumber(moneyAvailable)}`);
  }

  return moneyAvailable;
}

async function _hack(ns: NS, server: InternalServer, verbose = false): Promise<number> {
  if (verbose) ns.enableLog("hack");

  let amountStolen = 0;
  const hackLevel = ns.getHackingLevel();

  if (hackLevel >= server.thresholds.minHackLevel) {
    // ?: Why does it seem like the original `amountStolen` is wrong?
    amountStolen = await ns.hack(server.name);
    if (amountStolen > 0) {
      ns.print(`INFO :: Stole $${ns.formatNumber(amountStolen)} from ${server.name}.`);
    } else {
      ns.print(`ERROR :: Failed to steal from ${server.name}.`);
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

    await ns.sleep(1000);
  }
}
