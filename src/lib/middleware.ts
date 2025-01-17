import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect"; // Correct import for next-connect

import multer from "multer"; // Multer import for file uploads

// Configure multer for file uploads
const upload = multer({
  dest: "/tmp",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Helper function to wrap Next.js API routes with middleware
export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Middleware to handle file uploads
export const uploadMiddleware = nextConnect<NextApiRequest, NextApiResponse>().use(upload.single("resume"));
