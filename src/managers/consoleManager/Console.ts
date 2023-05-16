
import { NS } from '@ns';

interface IConsoleAction {
  function: () => void,
  help: string;
}

export async function main(ns: NS) {
  const allowedAction: Record<string, IConsoleAction> = {
    help: {
      function: help,
      help: "Print this."
    },
    kill: {
      function: kill,
      help: "Kill the orchestra"
    },
    pause: {
      function: pause,
      help: "This will pause the HackManager, it will let the conductor finish first."
    },
    resume: {
      function: resume,
      help: "Resume the hack manager after a pause."
    },
    messageQueue: {
      function: messageQueue,
      help: "See the current message queue, useful for debugging"
    },
    threadsUse: {
      function: threadsUse,
      help: "Show the current status of the Threads Manager."
    },
    printHacks: {
      function: printHacks,
      help: "Print the current hack algorithm calculations."
    },
    printRunningHacks: {
      function: printRunningHacks,
      help: "Print the current running hacks."
    },
    switchHackMode: {
      function: switchHackMode,
      help: "Switch between XP only hacking or Money focused hacking."
    }
  };

  let action: string = ns.args[0] as string;
  if (!action) {
    action = "help";
  }

  if (!Object.keys(allowedAction).includes(action)) {
    ns.tprint("Invalid operation");
    action = "help";
  }

  // TODO: Add a channel to the console, so we can send messages to the console.
  // const mySelf: ChannelName = ChannelName.consoleLink;
  // const messageHandler: MessageHandler = new MessageHandler(ns, mySelf);

  await allowedAction[action].function();

  // region functions

  async function help() {
    ns.print('help');
  }

  async function kill() {
    ns.print('kill');
  }

  async function pause() {
    ns.print('pause');
  }

  async function resume() {
    ns.print('resume');
  }

  async function messageQueue() {
    ns.print('messageQueue');
  }

  async function threadsUse() {
    ns.print('threadsUse');
  }

  async function printHacks() {
    ns.print('printHacks');
  }

  async function printRunningHacks() {
    ns.print('printRunningHacks');
  }

  async function switchHackMode() {
    ns.print('switchHackMode');
  }

  // endregion functions

}
