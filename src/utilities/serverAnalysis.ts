
import { NS, Server, Player } from '@ns';
import { Colors, ratioColor } from '/config/constants';

class ServerAnalyzer {
  private ns: NS;
  private player: Player;
  private server: Server;

  constructor(ns: NS, server: Server, player: Player) {
    this.ns = ns;
    this.player = player;
    this.server = server;
  }

  public propString(name: string): string {
    return `${Colors.Cyan}${name}:${Colors.Reset}`;
  }

  public safePercent(dividend: number, divisor: number): string {
    const percent = divisor > 0 && dividend <= divisor ?
      this.ns.formatPercent(dividend / divisor, 0) : '100%';
    return percent;
  }

  public cpuToString(): string {
    const string = `${this.server.cpuCores} cores`;
    return `${string}${Colors.Reset}`;
  }

  public ramToString(): string {
    const ramUsed = this.ns.formatRam(this.server.ramUsed);
    const ramMax = this.ns.formatRam(this.server.maxRam);
    const ratio = this.server.ramUsed / this.server.maxRam;
    const string = `${ramUsed} / ${ramMax} ${ratioColor(ratio)}(${this.safePercent(ratio, 2)})`;
    return `${string}${Colors.Reset}`;
  }

  public portsToString(): string {
    const portsOpen = this.server.openPortCount ?? 0;
    const portsRequired = this.server.numOpenPortsRequired ?? 0;
    const ratio = portsOpen / portsRequired;

    const string = `${portsOpen} opened / ${portsRequired} required ${ratioColor(ratio)}(${this.safePercent(portsOpen, portsRequired) } complete)`;
    return string;
  }

  public hackTimeToString(): string {
    const hackTime = this.ns.getHackTime(this.server.hostname);
    const hackTimeSeconds = this.ns.formatNumber((hackTime / 1000), 0);
    const hackTimeMinutes = this.ns.formatNumber((hackTime / 1000 / 60), 0);
    const hackTimeHours = this.ns.formatNumber((hackTime / 1000 / 60 / 60), 0);

    const string = `${hackTimeHours}h ${hackTimeMinutes}m ${hackTimeSeconds}s`;
    return string;
  }

  public moneyToString(): string {
    const moneyAvailable = this.server.moneyAvailable ?? 0;
    const moneyMax = this.server.moneyMax ?? 0;
    const ratio = this.safePercent(moneyAvailable, moneyMax);

    return `${moneyAvailable} / ${moneyMax} (${ratio} available)`;
  }

  public securityLevelToString(): string {
    const base = this.server.baseDifficulty;
    const current = this.server.hackDifficulty;
    const minimum = this.server.minDifficulty;

    return `${current} / ${base} (min: ${minimum})`;
  }

  public hackLevelToString(): string {
    const required = this.server.requiredHackingSkill ?? 0;
    const current = this.player.skills.hacking;
    const ratio = this.safePercent(current, required);

    return `${current} / ${required} (${ratio} complete)`;
  }

  public hr = `${Colors.White}${'-'.repeat(64)}${Colors.Reset}`;

  public analysisHeaderToString(): string {
    const hostName = this.server.hostname;
    const ip = this.server.ip;
    const icons: string[] = [];
    icons.push(this.server.organizationName ? '🏢' : (this.server.purchasedByPlayer ? '👤' : ''));
    icons.push(this.server.hasAdminRights ? '⚡' : '');
    icons.push(this.server.backdoorInstalled ? '🚪' : '');

    const titleLine = `${icons.join('')}${Colors.Black}[${ip}] ${Colors.Cyan}${hostName}:`

    const string = `${this.hr}\r\n${titleLine}`;
    return string;
  }

  public analyze(): void {
    this.ns.tprint(`
${this.analysisHeaderToString()}
  ${this.propString('CPU')} ${this.cpuToString()}
  ${this.propString('RAM')} ${this.ramToString()}
  ${this.propString('Organization')} ${this.server.organizationName}
  ${this.propString('Personal')} ${this.server.purchasedByPlayer}
  ${this.propString('Connected')} ${this.server.isConnectedTo}
  ${this.propString('Hack Lvl')} ${this.hackLevelToString()}
  ${this.propString('Security Level')} ${this.securityLevelToString()}
  ${this.propString('Money')} ${this.moneyToString()}
  ${this.propString('Growth')} ${this.server.serverGrowth}
  ${this.propString('Hack Time')} ${this.hackTimeToString()}
  ${this.propString('Ports')} ${this.portsToString()}
    ${this.propString('SSH')} ${this.server.sshPortOpen}
    ${this.propString('FTP')} ${this.server.ftpPortOpen}
    ${this.propString('SMTP')} ${this.server.smtpPortOpen}
    ${this.propString('HTTP')} ${this.server.httpPortOpen}
    ${this.propString('SQL')} ${this.server.sqlPortOpen}
    `);
  }
}

/*
function getServerDetails(ns: NS, server: string): any {
  const serverDetails = {
    name: server,
    childServers: ns.scan(server),
    memory: {
      used: ns.getServerUsedRam(server),
      max: ns.getServerMaxRam(server)
    }
  }

  return serverDetails;
}
*/

/* function getChildServers(ns: NS, server: string): string[] {
  const children = ns.scan(server);
  const childServers = children.filter(child => child !== "home" && child !== server);

  return childServers;
} */

export async function main(ns: NS): Promise<void> {

  const args = ns.flags([["help", false]]);
  const hostName = ns.args[0] as string;

  if (args.help || !hostName) {
    const scriptName = ns.getScriptName();

    ns.tprint(`
This script does a more detailed analysis of a server.
RAM Usage: ${ns.formatRam(ns.getScriptRam(scriptName))}
Usage: run ${scriptName} SERVER
Example: run ${scriptName} n00dles
`);
    return;
  }

  // ns.tail();
  // ns.clearLog();

  const server = ns.getServer(hostName);
  const player = ns.getPlayer();

  const analyzer = new ServerAnalyzer(ns, server, player);
  analyzer.analyze();
}
