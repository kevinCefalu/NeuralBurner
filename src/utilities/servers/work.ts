
import { NS } from '@ns';

export async function startScript(ns: NS, hostName: string, filePath: string, scriptRam: number,
  maxRam = 0, killAll = true): Promise<number> {

  if (killAll) {
    // Kill existing scripts on purchased server
    ns.killall(hostName);
    await ns.sleep(1000);
  }

  // Copy hack script to purchased server
  ns.scp(filePath, hostName);

  // Get details about purchased server RAM
  const ramUsed = ns.getServerUsedRam(hostName);

  if (maxRam === 0) {
    maxRam = ns.getServerMaxRam(hostName);
  }

  // Run hack script on purchased server
  const pid = ns.exec(filePath, hostName, Math.floor((maxRam - ramUsed) / scriptRam));

  if (pid === 0) {
    ns.tprint(`ERROR: Failed to run script on "${hostName}".`);
  }

  return pid;
}

export async function main(ns: NS): Promise<void> {
  ns.clearLog();

  const flags = ns.flags([["tail", false]]);

  if (flags.tail as boolean) {
    ns.tail();
  }

  const filePaths = { hack: "hack.js" };
  const purchasedServers = ns.getPurchasedServers();
  const scriptRam = ns.getScriptRam(filePaths.hack);

  for (let i = 0; i < purchasedServers.length; i++) {
    await startScript(ns, purchasedServers[i], filePaths.hack,
      scriptRam, ns.getServerMaxRam(purchasedServers[i]));
  }
}
