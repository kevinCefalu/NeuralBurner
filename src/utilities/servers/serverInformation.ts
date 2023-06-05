/** @param {NS} ns */
import { NS, Server } from '@ns';

enum Colors {
  Black = "\x1b[30m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  White = "\x1b[37m",

  Reset = "\x1b[0m"
}

function ratioColor(num: number): string {
  return num >= 0.75 ? Colors.Green
    : num >= 0.50 ? Colors.Yellow : Colors.Red;
}

export class ServerInfo {
  private ns: NS;

  private player: Player;
  public readonly server: Server;
  public readonly neighbors: string[] = [];

  public get name() { return this.server.hostname; }
  public get isOwned() { return this.name === 'home' || this.server.purchasedByPlayer; }

  constructor(ns: NS, name: string, player: Player = null, foundNames: string[]) {
    this.ns = ns;
    this.player = player ?? ns.getPlayer();
    this.server = this.ns.getServer(name);
    this.neighbors = this.ns.scan(name).filter((neighbor) =>
      neighbor !== name && neighbor !== 'home'
      && !neighbor.startsWith('server-')
    );
  }

  private hr = `${Colors.White}${'-'.repeat(64)}${Colors.Reset}`;

  public propString(name: string): string {
    return `${Colors.Cyan}${name}:${Colors.Reset}`;
  }

  public safePercent(dividend: number, divisor: number): string {

    let percent = '0';
    if (divisor > 0 && dividend <= divisor) {
      percent = this.ns.formatPercent(dividend / divisor, 0);
    } else if (divisor > 0 && dividend > divisor) {
      // percent = this.ns.formatPercent(1, 2);
      percent = '100%';
    } else {
      percent = '0%';
    }

    // const percent = divisor > 0 && dividend <= divisor ?
    //   this.ns.formatPercent(dividend / divisor, 2) : '100%';
    return percent;
  }

  public cpuToString(): string {
    return `${ this.server.cpuCores } cores${Colors.Reset}`;
  }

  public ramToString(): string {
    const ramUsed = this.ns.formatRam(this.server.ramUsed);
    const ramMax = this.ns.formatRam(this.server.maxRam);
    const ratio = this.server.ramUsed / this.server.maxRam;

    return `${ramUsed} / ${ramMax} ${ratioColor(ratio)}` +
      `(${this.safePercent(ratio, 2)})${Colors.Reset}`;
  }

  public portsToString(): string {
    const portsOpen = this.server.openPortCount ?? 0;
    const portsRequired = this.server.numOpenPortsRequired ?? 0;

    return `${portsOpen} opened / ${portsRequired} required ` +
      `${ratioColor(portsOpen / portsRequired)}` +
      `(${this.safePercent(portsOpen, portsRequired)} complete)` +
      `${Colors.Reset}`;
  }

  public hackTimeToString(): string {
    const hackTime = this.ns.getHackTime(this.server.hostname);
    const hackTimeSeconds = this.ns.formatNumber((hackTime / 1000), 0);
    const hackTimeMinutes = this.ns.formatNumber((hackTime / 1000 / 60), 0);
    const hackTimeHours = this.ns.formatNumber((hackTime / 1000 / 60 / 60), 0);

    return `${hackTimeHours}h ${hackTimeMinutes}m ${hackTimeSeconds}s${Colors.Reset}`;
  }

  public moneyToString(): string {
    const moneyAvailable = this.server.moneyAvailable ?? 0;
    const moneyMax = this.server.moneyMax ?? 0;

    return `$${this.ns.formatNumber(moneyAvailable)} / $${this.ns.formatNumber(moneyMax)} ` +
      `${ratioColor(moneyAvailable / moneyMax)}(${this.safePercent(moneyAvailable, moneyMax)} ` +
      `available)${Colors.Reset}`;
  }

  public securityLevelToString(): string {
    return `${this.ns.formatNumber(this.server.hackDifficulty, 2)} / ` +
      `${this.ns.formatNumber(this.server.baseDifficulty, 2)} ` +
      `(min: ${this.ns.formatNumber(this.server.minDifficulty, 2)})`;
  }

  public hackLevelToString(): string {
    const required = this.server.requiredHackingSkill ?? 0;
    const current = this.player.skills.hacking;

    return `${current} / ${required} ${ratioColor(current / required)}` +
      `(${this.safePercent(current, required)} complete)${Colors.Reset}`;
  }

  public headerToString(): string {
    const icons: string[] = [];
    icons.push(this.server.organizationName ? '🏢' : (this.isOwned ? '👤' : ''));
    icons.push(this.server.hasAdminRights ? '⚡' : '');
    icons.push(this.server.backdoorInstalled ? '🚪' : '');
    icons.push(this.server.isConnectedTo ? '🔌' : '');

    return ` ${icons.join('')} ${Colors.Cyan}${this.name}:${Colors.Reset}`;
  }

  public display(): void {
    this.ns.tprint(`${this.headerToString()}
  ${this.propString('CPU')} ${this.cpuToString()}
  ${this.propString('RAM')} ${this.ramToString()}
  ${this.propString('Organization')} ${this.server.organizationName}
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

export class ServerInfoCollection implements Iterable<T> {
  private readonly ns: NS;
  private readonly player: Player;
  private servers: ServerInfo[] = [];

  constructor(ns: NS, player: Player = null, servers: ServerInfo[] = []) {
    this.ns = ns;
    this.player = player ?? ns.getPlayer();
    this.servers = servers;

    this.initialize();
  }

  private initialize(): void {
    this.addByName('home');
    this.ns.scan().forEach((name) => this.addByName(name));
  }

  public *[Symbol.iterator]() {
    for (const server of this.servers) {
      yield server;
    }
  }

  public get count() {
    return this.servers.length;
  }

  public get foundNames(): string[] {
    return this.servers.map((server) => server.name);
  }

  public get(index: number) {
    return this.servers[index];
  }

  public add(server: ServerInfo) {
    this.servers.push(server);
  }

  public addByName(name: string): void {
    // If the server already exists, don't add it again.
    if (!this.servers.some((server) => server.name === name)) {
      const newServer = new ServerInfo(this.ns, name, this.player);
      this.add(newServer);

      // Add the server's neighbors to the collection.
      newServer.neighbors.forEach((neighbor) => {
        if (!this.foundNames.includes(neighbor)) {
          this.addByName(neighbor)
        }
      });
    }
  }

  public filter(predicate: (server: ServerInfo) => boolean): ServerInfo[] {
    return this.servers.filter(predicate);
  }

  public find(predicate: (server: ServerInfo) => boolean): ServerInfo {
    return this.servers.find(predicate);
  }

  public findByName(name: string): ServerInfo {
    return this.find((server) => server.name === name);
  }

  public some(predicate: (server: ServerInfo) => boolean): boolean {
    return this.servers.some(predicate);
  }

  public remove(server: ServerInfo) {
    const index = this.servers.indexOf(server);
    if (index !== -1) {
      this.servers.splice(index, 1);
    }
  }

  public clear() {
    this.servers = [];
  }

  public display(): void {
    this.servers.forEach((server) => server.display());
  }
}
