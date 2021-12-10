class SongsHandler {
  constructor(service, validator) {
    this._songsService = service;
    this._validator = validator;

    this.getSongsHandler = this.getAllSong.bind(this);
    this.getSongHandler = this.getSongById.bind(this);
    this.createSongHandler = this.createSong.bind(this);
    this.updateSongHandler = this.updateSong.bind(this);
    this.deleteSongHandler = this.deleteSong.bind(this);
  }

  async getAllSong(_, h) {
    const allSong = await this._songsService.getAllSong();
    return h.response({
      status: 'success',
      message: 'Successfully get all songs',
      data: { songs: allSong },
    });
  }

  async getSongById(req, h) {
    const song = await this._songsService.getSongById(req.params.id);
    return h.response({
      status: 'success',
      message: 'Successfully get song',
      data: { song },
    });
  }

  async createSong(req, h) {
    this._validator.validateSongPayload(req.payload);
    const song = await this._songsService.createSong(req.payload);
    return h
      .response({
        status: 'success',
        message: 'Successfully create song',
        data: {
          songId: song,
        },
      })
      .code(201);
  }

  async updateSong(req, h) {
    this._validator.validateSongPayload(req.payload);
    const song = await this._songsService.updateSong(
      req.params.id,
      req.payload
    );
    return h.response({
      status: 'success',
      message: 'Successfully update song',
      data: {
        song,
      },
    });
  }

  async deleteSong(req, h) {
    const song = await this._songsService.deleteSong(req.params.id);
    return h.response({
      status: 'success',
      message: 'Successfully delete song',
      data: song,
    });
  }
}

module.exports = SongsHandler;
