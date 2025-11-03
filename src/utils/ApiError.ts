import { HTTP_STATUS } from "./httpStatus";
import { ResponseMessages } from "../constants/responseMessages";
import { NextFunction } from "express";

class ApiError extends Error {
   success: boolean;
   statusCode: number;
   message: string;

   constructor(statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, message: string = ResponseMessages.ERROR.INTERNAL_SERVER_ERROR) {
      super(message);
      this.statusCode = statusCode;
      this.success = false;
      this.message = message;

      Error.captureStackTrace(this, this.constructor);
   }

   static badRequest(next: NextFunction, message: string = ResponseMessages.ERROR.BAD_REQUEST) {
      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, message));
   }

   static unauthorized(next: NextFunction, message: string = ResponseMessages.ERROR.UNAUTHORIZED) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, message));
   }

   static forbidden(next: NextFunction, message: string = ResponseMessages.ERROR.FORBIDDEN) {
      return next(new ApiError(HTTP_STATUS.FORBIDDEN, message));
   }

   static notFound(next: NextFunction, message: string = ResponseMessages.ERROR.NOT_FOUND) {
      return next(new ApiError(HTTP_STATUS.NOT_FOUND, message));
   }

   static conflict(next: NextFunction, message: string = ResponseMessages.ERROR.CONFLICT) {
      return next(new ApiError(HTTP_STATUS.CONFLICT, message));
   }

   static internalError(next: NextFunction, message: string = ResponseMessages.ERROR.INTERNAL_SERVER_ERROR) {
      return next(new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message));
   }

   static custom(next: NextFunction, statusCode: number, message: string) {
      return next(new ApiError(statusCode, message));
   }
}

export default ApiError;
