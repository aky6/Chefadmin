export function handleError(errorObj: any) {
  console.log(errorObj);
  if (typeof errorObj.error === 'string') {
    return errorObj.error;
  } else if (typeof errorObj.error === 'object') {
    if (errorObj.error && 'text' in errorObj.error) {
      const errorMsg = errorObj.error.text;
      return errorMsg;
    } else if (errorObj.error && 'error' in errorObj.error) {
      const key = Object.keys(errorObj.error)[0];
      const errorMsg: any = errorObj.error.error[key][0].message;
      return errorMsg;
    } else {
      return errorObj.error
        ? errorObj.error.title || errorObj.statusText
        : errorObj.statusText;
    }
  } else {
    console.log(errorObj);
    return errorObj.statusText;
  }
}
