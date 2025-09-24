const successResponse = (_res, _status = 200, _message = "success", _data) => {
  return _res
    .status(_status)
    .json({ success: true, message: _message, data: _data });
};

export { successResponse };
