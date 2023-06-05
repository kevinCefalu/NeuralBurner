
export enum ChannelName {
  bootScript = "bootScript",
  consoleLink = "consoleLink",
  hackConductor = "hackConductor",
  hackManager = "hackManager",
  hackScript = "hackScript",
  messageManager = "messageManager",
  serverManager = "serverManager",
  shareScript = "shareScript",
  targetManager = "targetManager",
  threadManager = "threadManager"
}

export enum Action {
  // Thread Manager Actions

  // Threads list
  threads = "threads",

  // The number of available threads
  threadsAvailable = "threadsAvailable",

  // Get some threads
  getThreads = "getThreads",

  // Get the total number of threads
  getThreadsAvailable = "getThreadsAvailable",

  // Free the threads
  freeThreads = "freeThreads",

  // Update a host
  updateHost = "updateHost",

  // Console command to print the current threads use
  consoleThreadsUse = "consoleThreadsUse",

  // To indicate a host lock request (preparing for update)
  lockHost = "lockHost",

  // To indicate that a host is locked (no threads are in use)
  hostLocked = "hostLocked",

  // To get the total amount of threads available
  getTotalThreads = "getTotalThreads",

  // Total amount of threads
  totalThreads = "totalThreads",
  useShareSwitch = "useShareSwitch",

  // Hack Manager Actions
  hackDone = "hackDone",
  hackReady = "hackRead",
  hackScriptDone = "hackScriptDone",
  weakenScriptDone = "weakenScriptDone",
  growScriptDone = "growScriptDone",
  hackPaused = "hackPaused",
  hackResume = "hackResume",
  printHacks = "printHacks",
  printRunningHacks = "printRunningHacks",
  switchHackMode = "switchHackMode",

  // Target Manager Actions
  addHost = "addHost",
  getHostList = "getHostList",

  // General Actions
  stop = "stop",
  pause = "pause",
  kill = "kill",
  resume = "resume",
  messageRequest = "messageRequest",
  noMessage = "noMessage",

  // Message Manager Actions
  dumpQueue = "dumpQueue",
  clearMyMessage = "clearMyMessage",
}
