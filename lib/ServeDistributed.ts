import fs from 'fs';
import path from 'path';

/**
 * Serves generated fragments over HTTP.
 */
export class ServeDistributed {
  public static readonly COLOR_RESET: string = '\u001B[0m';
  public static readonly COLOR_RED: string = '\u001B[31m';
  public static readonly COLOR_GREEN: string = '\u001B[32m';
  public static readonly COLOR_YELLOW: string = '\u001B[33m';
  public static readonly COLOR_BLUE: string = '\u001B[34m';
  public static readonly COLOR_MAGENTA: string = '\u001B[35m';
  public static readonly COLOR_CYAN: string = '\u001B[36m';
  public static readonly COLOR_GRAY: string = '\u001B[90m';

  private readonly authorization: 'WAC' | 'ACP';
  private readonly rootFilePath: string;
  private readonly logLevel: string;

  public constructor(options: IServeDistributedOptions) {
    this.authorization = options.authorization;
    this.rootFilePath = options.rootFilePath;
    this.logLevel = options.logLevel;
  }

  /**
   * Return a string in a given color
   * @param str The string that should be printed in
   * @param color A given color
   */
  public static withColor(str: any, color: string): string {
    return `${color}${str}${ServeDistributed.COLOR_RESET}`;
  }

  protected log(phase: string, status: string): void {
    process.stdout.write(`${ServeDistributed.withColor(`[${phase}]`, ServeDistributed.COLOR_CYAN)} ${status}\n`);
  }

  public async populateServers(): Promise<void> {
    const verbose = [ 'verbose', 'debug', 'silly' ].includes(this.logLevel);

    const urlToDirMap: Record<string, string> = {};

    const protocolDirs = await fs.promises.readdir(this.rootFilePath);
    for (const protocolDir of protocolDirs) {
      if (!(await fs.promises.lstat(path.join(this.rootFilePath, protocolDir))).isDirectory()) {
        continue;
      }

      const serverDirs = await fs.promises.readdir(path.join(this.rootFilePath, protocolDir));

      for (const serverDir of serverDirs) {
        let port: number | null = null;

        let hostname = serverDir;
        const splitLocation = serverDir.indexOf('_');
        if (serverDir.includes('_')) {
          hostname = serverDir.slice(0, splitLocation);
          port = Number.parseInt(serverDir.slice(splitLocation + 1), 10);

          urlToDirMap[`${protocolDir}://${hostname}:${port}/`] = path.join(this.rootFilePath, protocolDir, serverDir);
        } else {
          urlToDirMap[`${protocolDir}://${hostname}/`] = path.join(this.rootFilePath, protocolDir, serverDir);
        }
      }
    }

    const { populateServersFromDir } = await import('@imec-ilabt/css-populate');

    const infos = await populateServersFromDir({ verbose, urlToDirMap, authorization: this.authorization });

    for (const info of infos) {
      this.log(`Created user ${JSON.stringify(info)}`, 'info');
    }
  }
}

export interface IServeDistributedOptions {
  authorization: 'WAC' | 'ACP';
  rootFilePath: string;
  logLevel: string;
}
