import pDefer from 'p-defer';
import { Entry, ZipFile, fromBuffer } from 'yauzl';

function bufferStream(stream: NodeJS.ReadableStream) {
  return new Promise<Buffer>((accept, reject) => {
    const chunks: Buffer[] = [];
    stream
      .on('error', reject)
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => accept(Buffer.concat(chunks)));
  });
}

export async function* unzip(buffer: Buffer) {
  let defer: pDefer.DeferredPromise<Entry | null> = pDefer();
  let zipFile: ZipFile;

  fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
    if (err) throw err;
    zipFile = zipfile;

    zipfile.readEntry();
    zipfile.on('entry', (entry) => defer.resolve(entry));
    zipfile.once('end', () => defer.resolve(null));
  });

  while (true) {
    const entry = await defer.promise;
    if (entry === null) {
      break;
    }

    yield {
      entry,
      buffer: () => {
        return new Promise<Buffer>((resolve, reject) => {
          zipFile.openReadStream(entry, (err, stream) => {
            if (err) {
              reject(err);
            } else {
              resolve(bufferStream(stream));
            }
          });
        });
      },
    };

    defer = pDefer();
    zipFile!.readEntry();
  }
}