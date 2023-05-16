
import { NS, Server } from '@ns';

export class TargetServer {
  private ns: NS;

  public readonly name: string;
  private _server: Server | undefined;

  public get server(): Server | undefined {
    return this._server;
  }

  public set server(value: Server | undefined) {
    this._server = value;
  }

  constructor(ns: NS, name: string) {
    this.ns = ns;
    this.name = name;

    this._init();
  }

  private _init(): void {
    // HACK: TOO EXPENSIVE; break out into separate NS functions
    this._server = this.ns.getServer(this.name);
  }
}

export class TargetServerList {
  private ns: NS;
  private _servers: TargetServer[];

  public get servers(): TargetServer[] {
    return this._servers;
  }

  constructor(ns: NS, serverNames: string[]) {
    this.ns = ns;

    this._servers = serverNames.map((serverName) =>
      new TargetServer(this.ns, serverName));
  }
}
