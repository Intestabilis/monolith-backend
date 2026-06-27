import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../data-source.js";
import { Token } from "../entities/Token.js";
import { User } from "../entities/User.js";
import type { UserTokenDTO } from "../schemas/user.schema.js";

// change in prod ig

const tokenRepository = AppDataSource.getRepository(Token);
const userRepository = AppDataSource.getRepository(User);

const accessSecret = process.env.JWT_ACCESS_SECRET || "NOACCESSSECRETFORJWT";
const refreshSecret = process.env.JWT_ACCESS_SECRET || "NOREFRESHSECRETFORJWT";

const tokenService = {
  generateTokens: function (payload: UserTokenDTO) {
    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  },

  saveToken: async function (userId: string, refreshToken: string) {
    const tokenData = await tokenRepository.findOne({
      where: { user: { id: userId } },
    });
    // !!! AFTER THIS SELECTION USER IS UNDEFINED (my guess is because of using search by foreign id only), SO UPDATE ONLY REFRESHTOKEN FIELD!
    if (tokenData) {
      // to not do select inside save operation
      return await tokenRepository.update(tokenData.id, {
        refreshToken: tokenData.refreshToken,
      });
    }
    const user = await userRepository.findOneBy({ id: userId });
    // not sure how to handle this, IN THEORY user should 100% exist in this scenario but just in case throwing ar error
    // REVIEW
    if (user) {
      const token = new Token();
      token.refreshToken = refreshToken;
      token.user = user;
      return await tokenRepository.save(token);
    }
    throw new Error(
      "Something went wrong with saving token for this user, are you sure user with this id exists?",
    );
  },

  // In this two functions we'll just handle null with if guard clause
  removeToken: async function (refreshToken: string) {
    const tokenData = await tokenRepository.delete({ refreshToken });
    return tokenData;
  },
  findToken: async function (refreshToken: string) {
    const tokenData = await tokenRepository.findOneBy({ refreshToken });
    return tokenData;
  },
  validateAccessToken: function (token: string) {
    try {
      const userData = jwt.verify(token, accessSecret) as JwtPayload;
      return userData;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  validateRefreshToken: function (token: string) {
    try {
      const userData = jwt.verify(token, refreshSecret) as JwtPayload;
      return userData;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};

export default tokenService;
