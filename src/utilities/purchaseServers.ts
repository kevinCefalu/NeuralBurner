
import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  // ns.tail();
  ns.clearLog();

  const flags = ns.flags([["targetRam", 512]]);
  const targetRam = flags.targetRam as number;

  const prefix = 'server-';
  const filePaths = { hack: "hack.js" };

  const ramScript = ns.getScriptRam(filePaths.hack);
  const purchasedServerLimit = 25; // HACK: ns.getPurchasedServerLimit();
  const purchasedServers = ns.getPurchasedServers();
  const serverCost = ns.getPurchasedServerCost(targetRam);

  if (purchasedServers.length < purchasedServerLimit) {
    let i = 0;
    while (i < (purchasedServerLimit - purchasedServers.length)) {
      const newServerIndex = (purchasedServers.length + 1).toString().padStart(3, '0');
      const serverName = `${prefix}${newServerIndex}`;
      const availMoney = ns.getServerMoneyAvailable('home');

      if (availMoney > serverCost) {
        const purchasedServerName = ns.purchaseServer(serverName, targetRam);
        if (purchasedServerName === "") {
          ns.tprint(`ERROR: Failed to purchase "${purchasedServerName}". Moving on...`);
        } else {
          purchasedServers.push(purchasedServerName);
          ns.print(`INFO: Purchased server ${purchasedServerName} for ${ns.formatNumber(serverCost)}.`);
          i++;
        }
      } else {
        ns.tprint(`WARN: Insufficient funds to purchase "${serverName}". Need ${ns.formatNumber(serverCost)} but only have ${ns.formatNumber(availMoney)}.`);
        await ns.sleep(60000);
      }

      // !: Removing this line will cause an infinite loop and crash the game.
      await ns.sleep(500);
    }
  } else {
    ns.tprint(`WARN: Purchased server limit reached (${purchasedServerLimit}).`);
  }

  for(let i = 0; i < purchasedServers.length; i++) {
    if ((ns.getServerMaxRam(purchasedServers[i])) < targetRam) {
      const cost = ns.getPurchasedServerUpgradeCost(purchasedServers[i], targetRam);
      const balance = ns.getServerMoneyAvailable('home');
      const msgSuffix = `${purchasedServers[i]} to ${ns.formatRam(targetRam)}`;
      const availMoney = ns.getServerMoneyAvailable('home');

      if (cost < balance) {
        if (ns.upgradePurchasedServer(purchasedServers[i], targetRam)) {
          ns.print(`INFO: Upgraded ${msgSuffix} for ${cost}.`);
        } else {
          ns.tprint(`ERROR: Failed to upgrade ${msgSuffix}.`);
        }
      } else {
        ns.tprint(`WARN: Insufficient funds to upgrade ${msgSuffix}. Need ${ns.formatNumber(serverCost)} but only have ${ns.formatNumber(availMoney)}.`);
      }
    }

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
