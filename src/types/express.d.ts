import * as express from "express";
import type { UserTokenDTO } from "../schemas/user.schema.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenDTO;
    }
  }
}
