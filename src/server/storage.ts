import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';

type UploadResult = {
  url: string;
  key?: string;
};

export async function uploadBuffer(filename: string, buffer: Buffer, contentType?: string): Promise<UploadResult> {
  const safeName = filename;
  // Cloudinary provider

  if (PROVIDER === 'cloudinary') {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dw5y4x8jm';
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    // KEYNAME is a fixed prefix/folder name requested by the user
    const keyName = process.env.CLOUDINARY_KEYNAME || 'test';
    // folder: if CLOUDINARY_FOLDER provided use it, otherwise use keyName (fixed folder)
    const folder = process.env.CLOUDINARY_FOLDER || keyName;

    if (!apiKey || !apiSecret) {
      throw new Error('Cloudinary configured but CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are missing');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Convert to data URI
    const mime = contentType || 'application/octet-stream';
    const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;

    // Use fixed folder and keyname mode: upload into folder and use safe file base name as public_id
    const baseName = path.parse(safeName).name; // without extension
    const opts: any = { resource_type: 'image', folder };
    // set public_id to the base name under the folder (Cloudinary will ensure uniqueness if configured)
    opts.public_id = baseName;

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(dataUri, opts, (error, res) => {
        if (error) return reject(error);
        resolve(res);
      });
    });

    return { url: result.secure_url, key: result.public_id };
  }

  // Local fallback: write into public/uploads
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, safeName);
  fs.writeFileSync(filePath, buffer);
  return { url: `/uploads/${safeName}`, key: safeName };
}

export default { uploadBuffer };
