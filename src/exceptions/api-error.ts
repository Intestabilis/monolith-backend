export default abstract class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: unknown[] = [],
  ) {
    super(message);
  }
}
