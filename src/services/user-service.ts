import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";

import bcrypt from "bcrypt";
import tokenService from "./token-service.js";
import type { UserTokenDTO } from "../schemas/user.schema.js";
import UnauthenticatedError from "../exceptions/unauthenticated.js";
import BadRequestError from "../exceptions/bad-request.js";
import NotFoundError from "../exceptions/not-found.js";

const userRepository = AppDataSource.getRepository(User);

const userService = {
  createUser: async function (
    email: string,
    username: string,
    password: string,
  ) {
    const possibleUser = await userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (possibleUser)
      throw new BadRequestError(
        "User with this email or username is already exist",
      );
    // CHANGE salt
    const passwordHash = await bcrypt.hash(password, 2);
    const activationLink = uuidv4();

    const user = await userRepository.save({
      email,
      username,
      passwordHash,
      activationLink,
    });

    // TODO SEND ACTIVATION LINK EMAIL ETC WITH EMAIL SERVICE

    const tokens = tokenService.generateTokens({
      id: user.id,
      username: user.username,
      email: user.email,
      isActivated: user.isActivated,
    });
    await tokenService.saveToken(user.id, tokens.refreshToken);
    return { ...tokens, user };
  },

  loginUser: async function (email: string, password: string) {
    const user = await userRepository.findOneBy({ email });
    if (!user) throw new NotFoundError("User with this email does not exist");

    const isPasswordEqual = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordEqual) throw new BadRequestError("Password is incorrect");

    const userDto: UserTokenDTO = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActivated: user.isActivated,
    };

    const tokens = tokenService.generateTokens(userDto);
    return { ...tokens, user: userDto };
  },

  logoutUser: async function (refreshToken: string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  },

  activateUser: async function (activationLink: string) {
    const user = await userRepository.findOneBy({ activationLink });
    if (!user) throw new NotFoundError("No user with this activation link");
    user.isActivated = true;
    await userRepository.update(user.id, { isActivated: user.isActivated });
  },

  refreshUserToken: async function (refreshToken: string) {
    if (!refreshToken)
      throw new UnauthenticatedError(
        "User is not authenticated for this request",
      );

    const userData = await tokenService.validateRefreshToken(refreshToken);
    const token = await tokenService.findToken(refreshToken);

    if (!userData || token)
      throw new UnauthenticatedError(
        "User is not authenticated for this request",
      );

    const user = await userRepository.findOneBy({ id: userData.id });

    // should not trigger since token should contain only actual user id, but just in case
    if (!user) throw new NotFoundError("There is no user for this token");

    const userDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActivated: user.isActivated,
    };
    const tokens = tokenService.generateTokens(userDto);
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  },

  getUserById: async function (id: string) {
    const user = await userRepository.findOneBy({ id });
    if (!user) throw new NotFoundError("There is no user with this id");

    const userDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActivated: user.isActivated,
      avatarUrl: user.avatarUrl,
    };
    return userDto;
  },

  getUserStatus: async function (id: string) {
    // REVIEW can add global roles like user, admin, some other needed info in the future (to justify this as an additional logic with already existing getUserById)
    const user = await userRepository.findOne({
      where: { id },
      select: { id: true, isActivated: true },
    });

    if (!user)
      throw new UnauthenticatedError("There is no more user with this id!");
    const userStatus = { id: user.id, isActivated: user.isActivated };
    return userStatus;
  },
};

export default userService;
