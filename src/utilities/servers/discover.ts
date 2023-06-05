/** @param {NS} ns */
import { NS } from '@ns';
import { ServerInfoCollection, ServerInfo } from './serverInformation';

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("ALL");

  const flags = ns.flags([["names", false], ["tail", false]]);

  if (flags.tail as boolean) {
    ns.tail();
    ns.resizeTail(181, 42);
  }

  const serverCollection = new ServerInfoCollection(ns);
  for (const server of serverCollection) {
    if (!server.isOwned) {
      if (flags.names as boolean) {
        ns.tprint(server.name);
      }
      else {
        server.display();
      }
    }
  }
}
