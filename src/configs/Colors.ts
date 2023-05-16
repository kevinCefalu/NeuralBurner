
export enum Colors {
  Black = "\x1b[30m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  White = "\x1b[37m",

  Reset = "\x1b[0m"
}

export function ratioColor(num: number): string {
  return num >= 0.75 ? Colors.Green
    : num >= 0.50 ? Colors.Yellow : Colors.Red;
}
