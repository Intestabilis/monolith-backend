import type { Response, Request, NextFunction } from "express";
import userService from "../services/user-service.js";
import NotFoundError from "../exceptions/not-found.js";

// REVIEW basically now we're getting all the same info that is in JWT token, but in the future should CHANGE it to basic info in JWT
// and complete (username, avatar url, some other bio info etc) there

const userController = {
  getUser: async function (req: Request, res: Response, next: NextFunction) {
    try {
      // once again, probably should use Request generics for ts to understand that there WILL be user after auth middleware
      if (!req.user) throw new NotFoundError("There is no user with this id");
      const { id } = req.user;
      const userData = await userService.getUserById(id);
      return res.status(200).json(userData);
    } catch (err) {
      next(err);
    }
  },
};

export default userController;
