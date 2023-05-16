import { NS } from "@ns";
import { nowString } from "common/Formatters";

export enum LogLevel {
  DEBUG,
  VERBOSE,
  INFO,
  WARN,
  ERROR,
  CRITICAL
}

export class Logger {
  private ns: NS;
  private defaultLogLevel: LogLevel;

  constructor(ns: NS, defaultLogLevel: LogLevel = LogLevel.INFO) {
    this.ns = ns;
    this.defaultLogLevel = defaultLogLevel;
  }

  public print(logLevel: LogLevel, message: string) {
    if (logLevel >= this.defaultLogLevel) {
      this.ns.print(`[${nowString()}][${logLevel}] :: ${message}`);
    }
  }
}
