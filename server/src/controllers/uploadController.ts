import type { Request, Response } from 'express';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!env.cloudinary.isConfigured) {
    throw ApiError.badRequest(
      'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the API server.',
    );
  }

  if (!req.file) {
    throw ApiError.badRequest('No image file provided. Use field name "image".');
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'deshicraft/products',
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
});
