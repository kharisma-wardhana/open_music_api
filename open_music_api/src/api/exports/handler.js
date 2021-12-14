class ExportHandler {
  constructor(service, playlistService, playlistSongService, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;
    this._playlistSongService = playlistSongService;

    this.postExportSongHandler = this.postExportSong.bind(this);
  }

  async postExportSong(req, h) {
    this._validator.validateExportSongPayload(req.payload);
    const { targetEmail } = req.payload;
    const { playlistId } = req.params;
    const { id: userId } = req.auth.credentials;

    await this._playlistService.validateAccess(playlistId, userId);
    const songs = await this._playlistSongService.getSongInPlaylist(playlistId);
    const message = {
      targetEmail,
      songs,
    };

    await this._service.sendMessage(
      process.env.NOTIF_QUEUE,
      JSON.stringify(message)
    );

    return h
      .response({
        status: 'success',
        message:
          'Your playlists will be exported shortly. Please check your email.',
      })
      .code(201);
  }
}

module.exports = ExportHandler;
