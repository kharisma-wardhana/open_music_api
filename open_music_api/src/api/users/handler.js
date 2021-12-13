class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler({ payload }, h) {
    this._validator.validateUserPayload(payload);
    const userId = await this._service.addUser({ payload });

    return h
      .response({
        status: 'success',
        message: 'User successfully created',
        data: {
          userId,
        },
      })
      .code(201);
  }

  async getUserByIdHandler(req, h) {
    const { id } = req.params;

    const user = await this._service.getUserById(id);

    return h.response({
      status: 'success',
      message: 'User successfully retrieved',
      data: {
        user,
      },
    });
  }
}

module.exports = UsersHandler;
