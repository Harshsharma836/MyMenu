import { NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { uploadBuffer } from '@/server/storage';

export async function POST(request: Request) {
  try {
    const contentTypeHeader = request.headers.get('content-type') || '';

    let filename: string | undefined;
    let buffer: Buffer | undefined;
    let mime: string | undefined;

    if (contentTypeHeader.includes('multipart/form-data')) {
      // Handle form uploads (preferred for large files / deployment)
      const form = await request.formData();
      const file = form.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Missing file in form data' }, { status: 400 });
      }
      filename = (file as any).name || 'upload';
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mime = (file as any).type || undefined;
    } else {
      // Fallback: accept JSON body with base64 data (legacy)
      const body = await request.json();
      filename = body.filename;
      const data = body.data;
      if (!filename || !data) {
        return NextResponse.json({ error: 'Missing filename or data' }, { status: 400 });
      }

      const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const commaIdx = data.indexOf(',');
      let base64 = data;
      if (commaIdx !== -1) {
        const meta = data.slice(0, commaIdx);
        base64 = data.slice(commaIdx + 1);
        const match = meta.match(/data:([^;]+);base64/);
        if (match) mime = match[1];
      }
      buffer = Buffer.from(base64, 'base64');
      // for JSON mode we will still add a unique prefix below
      filename = base;
    }

    if (!buffer) return NextResponse.json({ error: 'No file buffer' }, { status: 400 });
    if (!filename) return NextResponse.json({ error: 'No filename' }, { status: 400 });

    // sanitize and prefix filename for uniqueness
const baseSafe = path.basename(filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex');
    const safeName = `${unique}_${baseSafe}`;

    try {
      const res = await uploadBuffer(safeName, buffer, mime);
      return NextResponse.json({ url: res.url });
    } catch (e) {
      console.error('Storage upload failed', e);
      return NextResponse.json({ error: 'Failed to store upload' }, { status: 500 });
    }
  } catch (err) {
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
