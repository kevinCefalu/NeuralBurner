
import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  // ns.tail();
  ns.clearLog();

  const filePaths = { hack: "hack.js" };
  const ramScript = ns.getScriptRam(filePaths.hack);
  const purchasedServers = ns.getPurchasedServers();

  for (let i = 0; i < purchasedServers.length; i++) {
    // Kill existing scripts on purchased server
    ns.killall(purchasedServers[i]);
    await ns.sleep(1000);

    // Copy hack script to purchased server
    ns.scp(filePaths.hack, purchasedServers[i]);

    // Get details about purchased server RAM
    const ramMax = ns.getServerMaxRam(purchasedServers[i]);
    const ramUsed = ns.getServerUsedRam(purchasedServers[i]);

    // Run hack script on purchased server
    const newPid = ns.exec(filePaths.hack, purchasedServers[i],
      Math.floor((ramMax - ramUsed) / ramScript));

    if (newPid === 0) {
      ns.tprint(`ERROR: Failed to run script on "${purchasedServers[i]}".`);
    }
  }
}
