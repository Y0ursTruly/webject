import { Server as HttpServer } from 'node:http';
import { Server as HttpsServer } from 'node:https';
import { WebSocket } from 'ws';

type Server = HttpServer | HttpsServer;
type Filter = number | ((part: Part) => boolean);
type OnFail = (() => Promise<void>) | false;
type eventName = 'edit' | 'connect' | 'disconnect';
type tag = 'undefined' | 'Uint8Array' | 'Uint8ClampedArray' | 'Uint16Array' | 'Uint32Array' | 'BigUint64Array' | 'Int8Array' | 'Int16Array' | 'Int32Array' | 'Int64Array' | 'BigInt64Array' | 'Float32Array' | 'Float64Array' | 'BigInt' | 'Symbol';

interface AuthToken {
  authToken: string;
  filter: Filter;
  clients: Map<WebSocket, any>;
  object: any;
  locked: boolean;
  dispatch: Function;
  encoder?: (data: Buffer | string) => Buffer | string;
  decoder?: (data: Buffer | string) => Buffer | string;
}

interface Event {
  token: AuthToken | null;
  socket: WebSocket | null;
  type: 'edit' | 'connect' | 'disconnect';
  lock: (authToken?: string) => boolean;
  unlock: (authToken?: string) => boolean;
  preventDefault: () => void;
}

interface Webject {
  authTokens: Map<string, AuthToken>;
  addListener(event: eventName, reaction: (event: Event) => void): void;
  endListener(event: eventName, reaction: (event: Event) => void): void;
  addToken(filter: Filter, object?: any, specificToken?: string, coding?: Coding): string;
  endToken(authToken: string): boolean;
  lock(authToken: string): boolean;
  unlock(authToken: string): boolean;
}

interface Coding {
  encoder(data: Buffer | string): Buffer | string;
  decoder(data: Buffer | string): Buffer | string;
}

interface Part extends Array{
  0: string[],
  1?: any,
  2?: number | undefined,
  3?: tag | undefined
}

export function serve(object?: object, server?: Server): Webject;
export function connect(location: string, authToken: string, obj?: any, coding?: Coding, onFail?: OnFail): Promise<any>;
export function objToString(obj: any, noCache?: boolean): string;
export function stringToObj(string: string, obj?: any, constraint?: Filter): any;
export function sync(filePath: string, obj?: any, coding?: Coding): any;
export function desync(filePath: string): void;
export function partFilter(mandatoryPath: string[], allowAllEdits?: boolean): Filter;
export function setConsistency(object: any, isConsistent?: boolean): void;