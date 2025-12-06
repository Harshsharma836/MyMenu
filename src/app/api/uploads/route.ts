import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { uploadBuffer } from '@/server/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, data } = body;
    if (!filename || !data) {
      return NextResponse.json({ error: 'Missing filename or data' }, { status: 400 });
    }

    // sanitize base filename and prefix with a UUID for uniqueness
    const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex');
    const safeName = `${unique}_${base}`;

    // data expected as data:<mime>;base64,<payload> or raw base64
    let base64 = data;
    let contentType: string | undefined = undefined;
    const commaIdx = data.indexOf(',');
    if (commaIdx !== -1) {
      const meta = data.slice(0, commaIdx);
      base64 = data.slice(commaIdx + 1);
      const match = meta.match(/data:([^;]+);base64/);
      if (match) contentType = match[1];
    }

    const buffer = Buffer.from(base64, 'base64');

    // upload using storage helper (S3 or local)
    try {
      const res = await uploadBuffer(safeName, buffer, contentType);
      return NextResponse.json({ url: res.url });
    } catch (e) {
      console.error('Storage upload failed', e);
      return NextResponse.json({ error: 'Failed to store upload' }, { status: 500 });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
