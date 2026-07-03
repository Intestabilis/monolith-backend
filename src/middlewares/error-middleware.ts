import type { NextFunction, Request, Response } from "express";
import ApiError from "../exceptions/api-error.js";
import { ZodError, z } from "zod";
import multer from "multer";

export default function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err);

  // CHANGE do proper handle
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      // errors: err.issues.map((issue) => ({
      //   path: issue.path.join("."),
      //   message: issue.message,
      // })),
      errors: z.flattenError(err),
    });
  }

  // REVIEW maybe in multer middleware should throw some error with custom code like "UNSUPPORTED_FORMAT" and then handle it here similar to this one
  // for better consistency
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File size is too large",
    });
  }

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, err: err.errors });
  }
  return res
    .status(500)
    .json({ message: "Something went wrong on the server side" });
}
