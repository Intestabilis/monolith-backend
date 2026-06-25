import ApiError from "./api-error.js";

export default class UnauthorizedError extends ApiError {
  constructor(message = "You are not authorized", errors: unknown[] = []) {
    super(message, 403, errors);
  }
}
