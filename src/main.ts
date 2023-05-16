import { NS } from '@ns';
import millisecondsUntil from 'common/millisecondsUntil';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tprint('Hello World!');
  // jsut a test
  const ms = millisecondsUntil(new Date());
  ns.tprint(ms);
}
