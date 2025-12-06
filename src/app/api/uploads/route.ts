import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, data } = body;
    if (!filename || !data) {
      return NextResponse.json({ error: 'Missing filename or data' }, { status: 400 });
    }

    // sanitize filename
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // data expected as data:<mime>;base64,<payload> or raw base64
    let base64 = data;
    const commaIdx = data.indexOf(',');
    if (commaIdx !== -1) base64 = data.slice(commaIdx + 1);

    const buffer = Buffer.from(base64, 'base64');
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const urlPath = `/uploads/${safeName}`;
    return NextResponse.json({ url: urlPath });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
