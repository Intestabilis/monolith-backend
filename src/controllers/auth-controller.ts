// auth

import type { NextFunction, Request, Response } from "express";

import userService from "../services/user-service.js";
import UnauthenticatedError from "../exceptions/unauthenticated.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, username, password } = req.body;
    const userData = await userService.createUser(email, username, password);
    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      // if using https
      // secure: true
    });
    const { user, accessToken } = userData;
    return res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const userData = await userService.loginUser(email, password);
    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    const { user, accessToken } = userData;
    return res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.cookies;
    const token = await userService.logoutUser(refreshToken);
    res.clearCookie("refreshToken");
    return res.status(200).json(token);
  } catch (err) {
    next(err);
  }
}
export async function activate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const activationLink = req.params.link as string;
    await userService.activateUser(activationLink);
    return res.redirect(process.env.CLIENT_URL!);
  } catch (err) {
    next(err);
  }
}
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.cookies;
    const userData = await userService.refreshUserToken(refreshToken);
    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    const { user, accessToken } = userData;
    return res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function getStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user)
      throw new UnauthenticatedError("There is no user for this endpoint");
    const { id } = req.user;
    const userStatus = await userService.getUserStatus(id);
    return res.status(200).json(userStatus);
  } catch (err) {
    next(err);
  }
}
