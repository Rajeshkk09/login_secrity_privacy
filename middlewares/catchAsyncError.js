const catchAsyncError =  (fun)=>{
    return(res,req,next)=>{
        Promise.resolve(fun(res,req,next)).catch(next)
    }
}

module.exports = catchAsyncError;
