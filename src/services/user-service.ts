import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";

import bcrypt from "bcrypt";
import tokenService from "./token-service.js";
import type { UserTokenDTO } from "../schemas/user.schema.js";
import UnauthenticatedError from "../exceptions/unauthenticated.js";
import BadRequestError from "../exceptions/bad-request.js";
import NotFoundError from "../exceptions/not-found.js";
import emailService from "./email-service.js";
import { UserSecrets } from "../entities/UserSecrets.js";

const userRepository = AppDataSource.getRepository(User);
const userSecretsRepository = AppDataSource.getRepository(UserSecrets);

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
    const passwordHash = await bcrypt.hash(password, 4);

    const activationLink = uuidv4();
    const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    const secrets = userSecretsRepository.create({
      activationLink,
      activationExpires,
    });

    const user = await userRepository.save({
      email,
      username,
      passwordHash,
      secrets,
    });

    // Sending email with activation link
    // catch to still sign up user even if something wrong with email service and email wasn't sent
    emailService
      .sendActivationLink(user.email, activationLink)
      .catch((error) => {
        console.error(`Failed to send activation to ${user.email}:`, error);
        // REVIEW maybe add retry/logging/etc
      });

    // REVIEW maybe we actually should move token generation logic in controller(s) from this service? Now I'm not sure about this service as a correct place for this
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

  // REVIEW maybe do some additional user check

  activateUser: async function (activationLink: string) {
    const secrets = await userSecretsRepository.findOne({
      where: { activationLink },
      relations: { user: true },
    });

    if (!secrets) {
      throw new NotFoundError("This activation link does not exist or damaged");
    }

    if (secrets.activationExpires && secrets.activationExpires < new Date()) {
      throw new BadRequestError(
        "This activation link is expired, please, get a new one",
      );
    }

    const user = secrets.user;
    if (!user) throw new NotFoundError("No user with this activation link");

    user.isActivated = true;

    // maybe should place this after updating user in repository
    secrets.activationLink = null;
    secrets.activationExpires = null;

    await userRepository.update(user.id, { isActivated: user.isActivated });
    await userSecretsRepository.save(secrets);

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

  resendActivation: async function (userId: string) {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: { secrets: true },
    });

    if (!user) throw new NotFoundError("User with this id does not exist");

    if (user.isActivated)
      throw new BadRequestError("Account is already activated");

    let secrets = user.secrets;

    // fallback if secrets do not exist for some reason
    if (!secrets) {
      secrets = userSecretsRepository.create({ user: { id: userId } });
    }

    if (secrets.lastActivationEmailSentAt) {
      const timeSince =
        Date.now() - secrets.lastActivationEmailSentAt.getTime();
      if (timeSince < 15 * 60 * 1000) {
        const waitMinutes = Math.ceil((15 * 60 * 1000 - timeSince) / 60000);
        throw new BadRequestError(
          `Нещодавно ви вже робили цей запит, зачекайте ще ${waitMinutes} хвилин перед наступною спробою.`,
        );
      }
    }

    const newActivationLink = uuidv4();
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    secrets.activationLink = newActivationLink;
    secrets.activationExpires = newExpires;
    secrets.lastActivationEmailSentAt = new Date();

    await userSecretsRepository.save(secrets);

    emailService
      .sendActivationLink(user.email, newActivationLink)
      .catch((error) => {
        console.error(`Failed to resend activation to ${user.email}:`, error);
      });
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

  // maybe should separate these and other auth methods in it's own service later

  requestPasswordReset: async function (email: string) {
    const user = await userRepository.findOne({
      where: { email },
      relations: { secrets: true },
    });

    // REVIEW I guess we should do silent return there? Toast with this error on front-end doesn't make sense since users should know their email?
    if (!user) return;
    // if (!user) throw new NotFoundError("Користувач з таким email не існує");

    let secrets = user.secrets;

    // REVIEW this fallback + fallback in resendActivation
    // fallback if secrets do not exist for some reason
    if (!secrets) {
      secrets = userSecretsRepository.create({ user: { id: user.id } });
    }

    if (secrets.lastResetEmailSentAt) {
      const timeSince = Date.now() - secrets.lastResetEmailSentAt.getTime();
      if (timeSince < 15 * 60 * 1000) {
        const waitMinutes = Math.ceil((15 * 60 * 1000 - timeSince) / 60000);
        throw new BadRequestError(
          `Нещодавно ви вже робили цей запит, зачекайте ще ${waitMinutes} хвилин перед наступною спробою.`,
        );
      }
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    secrets.resetPasswordToken = resetToken;
    secrets.resetPasswordExpires = resetExpires;
    secrets.lastResetEmailSentAt = new Date();

    await userSecretsRepository.save(secrets);

    emailService
      .sendPasswordResetLink(user.email, resetToken)
      .catch((error) => {
        console.error(`Failed to send password reset to ${user.email}:`, error);
      });
  },

  resetPassword: async function (token: string, newPassword: string) {
    const secrets = await userSecretsRepository.findOne({
      where: { resetPasswordToken: token },
      relations: { user: true },
    });

    if (!secrets) {
      throw new BadRequestError("Недійсне посилання для скидання паролю");
    }

    if (
      secrets.resetPasswordExpires &&
      secrets.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestError("Час дії посилання вийшов, спробуйте заново");
    }

    const user = secrets.user;

    // CHANGE salt
    user.passwordHash = await bcrypt.hash(newPassword, 4);

    secrets.resetPasswordToken = null;
    secrets.resetPasswordExpires = null;

    await userRepository.save(user);
    await userSecretsRepository.save(secrets);
  },
};

export default userService;
