class AuthenticationsHandler {
  constructor(authService, userService, tokenManager, validator) {
    this._authService = authService;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthHandler = this.postAuthHandler.bind(this);
    this.putAuthHandler = this.putAuthHandler.bind(this);
    this.deleteAuthHandler = this.deleteAuthHandler.bind(this);
  }

  async postAuthHandler(req, h) {
    this._validator.validatePostAuthPayload(req.payload);
    const { username, password } = req.payload;
    const id = await this._userService.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });
    await this._authService.addRefreshToken(refreshToken);
    return h
      .response({
        status: 'success',
        message: 'Authentication successfully generated',
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);
  }

  async putAuthHandler(req, h) {
    this._validator.validatePutAuthPayload(req.payload);

    const { refreshToken } = req.payload;

    await this._authService.verifyRefreshToken(refreshToken);

    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ id });

    return h.response({
      status: 'success',
      message: 'Access Token successfully updated',
      data: {
        accessToken,
      },
    });
  }

  async deleteAuthHandler(req, h) {
    this._validator.validateDeleteAuthPayload(req.payload);

    const { refreshToken } = req.payload;
    await this._authService.verifyRefreshToken(refreshToken);
    await this._authService.deleteRefreshToken(refreshToken);

    return h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    });
  }
}

module.exports = AuthenticationsHandler;
