/** @param {NS} ns */
import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {

  const filePaths = { serverList: "allServers.txt" };
  const servers = ['home'];

  for (let i = 0; i < servers.length; i++) {
    const thisScan = ns.scan(servers[i]);

    for (let j = 0; j < thisScan.length; j++) {
      if (servers.indexOf(thisScan[j]) === -1) {
        servers.push(thisScan[j]);
      }
    }
  }

  servers.shift();

  ns.rm(filePaths.serverList);
  ns.write(filePaths.serverList, servers.join("\n"));
}
