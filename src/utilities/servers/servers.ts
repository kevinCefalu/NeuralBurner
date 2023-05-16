
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
