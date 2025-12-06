import fs from 'fs';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';

type UploadResult = {
  url: string;
  key?: string;
};

export async function uploadBuffer(filename: string, buffer: Buffer, contentType?: string): Promise<UploadResult> {
  const safeName = filename;
  if (PROVIDER === 's3') {
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    const endpoint = process.env.AWS_S3_ENDPOINT || undefined;
    if (!bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('S3 upload configured but AWS_S3_BUCKET/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are missing');
    }

    const client = new S3Client({
      region: region,
      endpoint: endpoint,
      forcePathStyle: !!process.env.AWS_S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const key = safeName;
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });
    await client.send(cmd);

    // Allow override of public base URL (useful for custom endpoints like DO Spaces)
    const publicBase = process.env.AWS_S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`;
    return { url: `${publicBase}/${encodeURIComponent(key)}`, key };
  }

  if (PROVIDER === 'cloudinary') {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_FOLDER;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configured but CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are missing');
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

    const opts: any = { resource_type: 'image' };
    if (folder) opts.folder = folder;

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
