
export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  ns.disableLog("ALL");

  const flags = ns.flags([
    ['verbose', false],
    ['tail', false]
  ]);

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

          // Copy hack script to purchased server
          ns.scp(filePaths.hack, purchasedServerName);

          // Get details about purchased server RAM
          const ramMax = ns.getServerMaxRam(purchasedServerName);
          const ramUsed = ns.getServerUsedRam(purchasedServerName);

          // Run hack script on purchased server
          const newPid = ns.exec(filePaths.hack, purchasedServerName,
            Math.floor((ramMax - ramUsed) / ramScript));

          if (newPid === 0) {
            ns.tprint(`ERROR: Failed to run script on "${purchasedServerName}".`);
          }
        }
      } else {
        ns.print(`WARN: Insufficient funds to purchase "${serverName}". Need ${ns.formatNumber(serverCost)} but only have ${ns.formatNumber(availMoney)}.`);
        await ns.sleep(60000);
      }

      // !: Removing this line will cause an infinite loop and crash the game.
      await ns.sleep(500);
    }
  } else {
    ns.print(`WARN: Purchased server limit reached (${purchasedServerLimit}).`);
  }
}
