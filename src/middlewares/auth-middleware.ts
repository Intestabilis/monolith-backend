import type { NextFunction, Request, Response } from "express";

import UnauthenticatedError from "../exceptions/unauthenticated.js";
import tokenService from "../services/token-service.js";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.headers.authorization;
    console.log(authorizationHeader);
    if (!authorizationHeader) return next(new UnauthenticatedError());
    // header syntax: Bearer {token}

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) return next(new UnauthenticatedError());

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) return next(new UnauthenticatedError());

    req.user = userData;

    next();
  } catch (err) {
    return next(err);
  }
}
