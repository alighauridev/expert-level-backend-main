import { HTTP_STATUS } from "./httpStatus";
import { ResponseMessages } from "../constants/responseMessages";
import { Response } from "express";

class ApiResponse<T> {
   success: boolean;
   statusCode: number;
   message: string;
   data: T;

   constructor(statusCode: number = HTTP_STATUS.OK, data: T, message: string = ResponseMessages.SUCCESS.OPERATION_SUCCESS) {
      this.success = statusCode < 400;
      this.statusCode = statusCode;
      this.message = message;
      this.data = data;
   }

   // Static methods for common success responses
   static success<T>(res: Response, data: T, message: string = ResponseMessages.SUCCESS.OPERATION_SUCCESS) {
      return res.status(HTTP_STATUS.OK).json({
         success: true,
         statusCode: HTTP_STATUS.OK,
         message,
         data
      });
   }

   static created<T>(res: Response, data: T, message: string = ResponseMessages.SUCCESS.DATA_CREATED) {
      return res.status(HTTP_STATUS.CREATED).json({
         success: true,
         statusCode: HTTP_STATUS.CREATED,
         message,
         data
      });
   }

   static updated<T>(res: Response, data: T, message: string = ResponseMessages.SUCCESS.DATA_UPDATED) {
      return res.status(HTTP_STATUS.OK).json({
         success: true,
         statusCode: HTTP_STATUS.OK,
         message,
         data
      });
   }

   static deleted(res: Response, message: string = ResponseMessages.SUCCESS.DATA_DELETED) {
      return res.status(HTTP_STATUS.NO_CONTENT).json({
         success: true,
         statusCode: HTTP_STATUS.NO_CONTENT,
         message
      });
   }

   static custom<T>(res: Response, statusCode: number, data: T, message: string) {
      return res.status(statusCode).json({
         success: statusCode < 400,
         statusCode,
         message,
         data
      });
   }
}

export default ApiResponse;
