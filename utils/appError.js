class AppError extends Error {
  constructor(_message, _status, _errors) {
    super(_message);
    this.status = _status;
    this.Errors = _errors;
  }

  set Errors(_err) {
    if (!_err) return;
    this.errors = _err;
  }
}
export default AppError;