
import numeral from "numeral";

export function formatMoney(value: number, decimalPlaces = 3): string {
  if (value === Infinity) return "∞";

  // const multiplier = Math.pow(10, decimalPlaces);
  // for (const [index, level] of levels.entries()) {
  //   if (value >= level) {
  //     const number = Math.round((value / level) * multiplier) / (10 * decimalPlaces);
  //     return number + notations[index] + "$";
  //   }
  // }
  // return value + "$";

  const amount = numeral(value).format(`($0.${'0'.repeat(decimalPlaces)} a)`);

  return amount;
}

/* interface Number {
  padNumber(): string;
}

Number.prototype.padNumber = padNumber; */

export function padNumber(value: number, length: number): string {
  return value.toString().padStart(length, '0');
}

export function nowString(): string {
  const now: Date = new Date(Date.now());
  const hh: string = padNumber(now.getHours(), 2);
  const mm: string = padNumber(now.getMinutes(), 2);
  const ss: string = padNumber(now.getSeconds(), 2);

  const string = `${hh}:${mm}:${ss}`;
  return string;
}
