declare module 'stream' {
  import { Writable } from 'node:stream';
  interface Writable {
    writeAhead(chunk: any, encoding?: BufferEncoding | undefined, cb?: ((error: Error | null | undefined) => void) | undefined): boolean;
    writeAhead(chunk: any, cb?: ((error: Error | null | undefined) => void) | undefined): boolean;
  }
}
