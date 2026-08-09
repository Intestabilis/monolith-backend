import type { NextFunction, Request, Response } from "express";
import UnauthorizedError from "../exceptions/unauthorized.js";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(
        // should be internal? not sure how to handle it tbh
        // like req.user MUST exist at this point
        new Error(
          "Activation middleware should be called only after auth middleware",
        ),
      );
    }

    if (!req.user.isActivated) {
      return next(
        new UnauthorizedError("Ця дія доступна тільки активованим акаунтам"),
      );
    }

    next();
  } catch (err) {
    return next(err);
  }
}
