import type { Argv } from 'yargs';
import { ServeDistributed } from '../ServeDistributed';

export const command = 'serve-distributed';
export const desc = 'Upload the fragments to the associated Solid servers';
export const builder = (yargs: Argv<any>): Argv<any> =>
  yargs
    .options({
      rootFilePath: {
        type: 'string',
        alias: 'r',
        describe: 'Path to the root folder containing the files to distrbute',
        default: 'out-fragments/',
      },
      authorization: {
        type: 'string',
        alias: 'a',
        describe: 'Type of Authorization (WAC, ACP)',
        default: 'WAC',
      },
      logLevel: {
        type: 'string',
        alias: 'l',
        describe: 'Logging level (error, warn, info, verbose, debug, silly)',
        default: 'info',
      },
    });
export const handler = async(argv: Record<string, any>): Promise<void> => new ServeDistributed({
  authorization: argv.authorization,
  rootFilePath: argv.rootFilePath,
  logLevel: argv.logLevel,
}).populateServers();
