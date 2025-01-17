// src/types/next.d.ts
import { IncomingMessage } from "http";
import * as multer from "multer";

// Extend the NextApiRequest type to include file properties from multer
declare module "next" {
  interface NextApiRequest extends IncomingMessage {
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }
}
