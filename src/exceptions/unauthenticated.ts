import ApiError from "./api-error.js";

export default class UnauthenticatedError extends ApiError {
  constructor(message = "You are not authenticated", errors: unknown[] = []) {
    super(message, 401, errors);
  }
}
