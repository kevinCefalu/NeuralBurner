// import ms from 'ms';
// import lunchtime from './managers/lunchtime.js';
// import millisecondsUntil from './common/millisecondsUntil.js';

// export default function howLongUntilLunch(hours: number = 12, minutes: number = 30): string {
//   const millisecondsUntilLunchTime = millisecondsUntil(lunchtime(hours, minutes));
//   return ms(millisecondsUntilLunchTime, { long: true });
// }


import { NS } from '@ns';

export async function main(ns: NS) {
  ns.tprint('Hello World!');
}
