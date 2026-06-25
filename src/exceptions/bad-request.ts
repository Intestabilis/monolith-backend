import ApiError from "./api-error.js";

export default class BadRequestError extends ApiError {
  constructor(message = "Invalid input data", errors: unknown[] = []) {
    super(message, 400, errors);
  }
}
