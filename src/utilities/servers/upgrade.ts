
import { NS } from '@ns';
// import { startScript } from "/utilities/servers/work";

async function startScript(ns: NS, hostName: string, filePath: string, scriptRam: number, maxRam = 0, killAll = true): Promise<number> {

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
  ns.disableLog('ALL');

  const flags = ns.flags([["targetRam", 512], ["tail", false]]);
  const targetRam = flags.targetRam as number;

  if (flags.tail as boolean) {
    ns.tail();
  }

  const filePaths = { hack: "hack.js" };
  const scriptRam = ns.getScriptRam(filePaths.hack);
  const serverCost = ns.getPurchasedServerCost(targetRam);
  const purchasedServers = ns.getPurchasedServers();

  for (let i = 0; i < purchasedServers.length; i++) {
    if ((ns.getServerMaxRam(purchasedServers[i])) < targetRam) {
      const cost = ns.getPurchasedServerUpgradeCost(purchasedServers[i], targetRam);
      const balance = ns.getServerMoneyAvailable('home');
      const msgSuffix = `${purchasedServers[i]} to ${ns.formatRam(targetRam)}`;

      if (cost < balance) {
        if (ns.upgradePurchasedServer(purchasedServers[i], targetRam)) {
          ns.print(`Upgraded ${msgSuffix} for $${ns.formatNumber(cost)}. Restarting work...`);
          await startScript(ns, purchasedServers[i], filePaths.hack, scriptRam, targetRam);
        } else {
          ns.tprint(`ERROR :: Failed to upgrade ${msgSuffix}.`);
        }
      } else {
        ns.tprint(`WARN :: Insufficient funds to upgrade ${msgSuffix}. ` +
          `Need ${ns.formatNumber(serverCost)} but only have ${ns.formatNumber(balance)}.`);
      }
    }
  }
}
