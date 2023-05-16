
import { NS } from '@ns';
import { InternalServer } from './servers/servers';

async function _weaken(ns: NS, server: InternalServer): Promise<number> {
  let securityLevel = ns.getServerSecurityLevel(server.name);

  if (securityLevel > server.thresholds.security) {
    ns.print(
      `WARN :: Weaken ${server.name} since current ` +
      `${ns.formatNumber(securityLevel)} > ` +
      `${ns.formatNumber(server.thresholds.security)} threshold.`
    );

    securityLevel -= await ns.weaken(server.name);
    ns.print(`INFO :: Weakened ${server.name} to ${ns.formatNumber(securityLevel)}`);
  }

  return securityLevel;
}

async function _grow(ns: NS, server: InternalServer): Promise<number> {
  let moneyAvailable = ns.getServerMoneyAvailable(server.name);

  if (moneyAvailable < server.thresholds.money) {
    ns.print(
      `WARN :: Grow ${server.name} since current ` +
      `$${ns.formatNumber(moneyAvailable)} > ` +
      `$${ns.formatNumber(server.thresholds.money)} threshold.`
    );

    moneyAvailable *= await ns.grow(server.name);
    ns.print(`INFO :: Grew ${server.name} to ${ns.formatNumber(moneyAvailable)}`);
  }

  return moneyAvailable;
}

async function _hack(ns: NS, server: InternalServer): Promise<number> {
  const hackLevel = ns.getHackingLevel();
  let amountStolen = 0;

  if (hackLevel >= server.thresholds.minHackLevel) {
    amountStolen = await ns.hack(server.name);
    ns.print(`INFO :: Stole ${ns.formatNumber(amountStolen)} from ${server.name}`);
  } else {
    ns.print(
      `WARN :: Cannot hack ${server.name} since current ` +
      `${ns.formatNumber(hackLevel, 0)} < ` +
      `${ns.formatNumber(server.thresholds.minHackLevel, 0)} threshold.`
    );
  }

  return amountStolen;
}

export async function attack(ns: NS, server: InternalServer): Promise<void> {
  ns.disableLog("getHackingLevel");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerRequiredHackingLevel");

  await _weaken(ns, server);
  await _grow(ns, server);
  await _hack(ns, server);
}
