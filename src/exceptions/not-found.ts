import ApiError from "./api-error.js";

export default class NotFoundError extends ApiError {
  constructor(message = "Not found!", errors: unknown[] = []) {
    super(message, 404, errors);
  }
}
