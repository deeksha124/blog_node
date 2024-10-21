

exports.successResponse = (res, message, statusCode, data) => {
    const response = {
      code : 0,
      error: false,
      message,
      data
    };
  
    return res.status(statusCode).json(response);
  };
  
  exports.errorResponse = (res, message, statusCode , data) => {
      let response = {
        code : 1 ,
        error: true,
        message,
        data
      };
    
      return res.status(statusCode).json(response);
    };
    
   exports.dbResponse = (statusCode, data = null) => {
      return {
        statusCode: statusCode,
        data: data,
      };
    };
