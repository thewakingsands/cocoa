export class HttpError extends Error {
  public constructor(public status: number, public message: string) {
    super(`HTTP_ERROR_${status}: ${message}`)
  }
}

export class BadRequestError extends HttpError {
  public constructor(public message: string) {
    super(400, message)
  }
}

export class UnauthorizedError extends HttpError {
  public constructor(public message: string) {
    super(401, message)
  }
}

export class ForbiddenError extends HttpError {
  public constructor(public message: string) {
    super(403, message)
  }
}

export class NotFoundError extends HttpError {
  public constructor(public message: string) {
    super(404, message)
  }
}

export class InternalServerError extends HttpError {
  public constructor(public message: string) {
    super(500, message)
  }
}
