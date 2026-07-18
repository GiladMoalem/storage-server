export const sendSuccessResponse = (res: any, data: any, message = "") => {
  return res.status(200).json({
    success: true,
    data,
    message
  });
};

export const sendErrorResponse = (res: any, message: string, code = "GENERAL_ERROR", status = 400) => {
  return res.status(status).json({
    success: false,
    error: { message, code }
  });
};
