import type { NextFunction, Request, Response } from "express";
import ApiError from "../exceptions/api-error.js";
import { ZodError, z } from "zod";

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

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, err: err.errors });
  }
  return res
    .status(500)
    .json({ message: "Something went wrong on the server side" });
}
