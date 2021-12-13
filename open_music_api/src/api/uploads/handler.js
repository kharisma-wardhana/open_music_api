class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postUploadImageHandler = this.postUploadImage.bind(this);
  }

  async postUploadImage(req, h) {
    const { data } = req.payload;
    this._validator.validateImagesHeaders(data.hapi.headers);

    const filename = await this._service.writeFile(data, data.hapi);
    const pictureUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/pictures/${filename}`;

    return h
      .response({
        status: 'success',
        data: {
          pictureUrl,
        },
      })
      .code(201);
  }
}

module.exports = UploadsHandler;
