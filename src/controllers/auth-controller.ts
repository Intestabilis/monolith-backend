// auth

import type { NextFunction, Request, Response } from "express";

import userService from "../services/user-service.js";
import UnauthenticatedError from "../exceptions/unauthenticated.js";
import tokenService from "../services/token-service.js";

const authController = {
  register: async function (req: Request, res: Response, next: NextFunction) {
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
  },
  login: async function (req: Request, res: Response, next: NextFunction) {
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
  },
  logout: async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logoutUser(refreshToken);
      res.clearCookie("refreshToken");
      return res.status(200).json(token);
    } catch (err) {
      next(err);
    }
  },
  activate: async function (req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link as string;
      const userData = await userService.activateUser(activationLink);

      const authHeader = req.headers.authorization;
      let currentUserId = null;

      if (authHeader) {
        const accessToken = authHeader.split(" ")[1];
        try {
          const tokenUserData = tokenService.validateAccessToken(accessToken!);
          if (tokenUserData) currentUserId = tokenUserData.id;
        } catch (e) {
          // ignoring validation errors
        }
      }

      const { user, accessToken, refreshToken } = userData;

      if (currentUserId === user.id) {
        res.cookie("refreshToken", refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });

        return res.json({
          message: "Акаунт успішно активовано",
          accessToken: accessToken,
        });
      }

      return res.json({
        message: "Акаунт успішно активовано. Будь ласка, увійдіть у систему",
      });
    } catch (err) {
      next(err);
    }
  },

  resendActivation: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user!.id;

      await userService.resendActivation(userId);

      return res.json({ message: "Новий лист активації успішно відправлено" });
    } catch (err) {
      next(err);
    }
  },

  refresh: async function (req: Request, res: Response, next: NextFunction) {
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
  },
  getStatus: async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        throw new UnauthenticatedError("There is no user for this endpoint");
      const { id } = req.user;
      const userStatus = await userService.getUserStatus(id);
      return res.status(200).json(userStatus);
    } catch (err) {
      next(err);
    }
  },

  forgotPassword: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;
      await userService.requestPasswordReset(email);

      return res.json({
        message:
          "Інструкції з відновлення пароля було надіслано на вказаний email",
      });
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token, newPassword } = req.body;
      await userService.resetPassword(token, newPassword);
      return res.json({
        message: "Пароль успішно змінено",
      });
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
