class PlaylistSongsHandler {
  constructor(playlistService, playlistSongService, validator) {
    this._playlistService = playlistService;
    this._playlistSongService = playlistSongService;
    this._validator = validator;

    this.addSongToPlaylistHandler = this.addSongToPlaylist.bind(this);
    this.getSongInPlaylistHandler = this.getSongInPlaylist.bind(this);
    this.removeSongFromPlaylistHandler = this.removeSongFromPlaylist.bind(this);
  }

  async addSongToPlaylist(req, h) {
    const { id: playlistId } = req.params;
    const { id: songId } = req.payload;
    const { id: userId } = req.auth.credentials;

    await this._playlistService.verifyPlaylistUser(playlistId, userId);

    const playlistSong = await this._playlistSongService.addSongToPlaylist(
      playlistId,
      songId
    );
    return h
      .response({
        status: 'success',
        message: 'Song added to playlist successfully',
        data: playlistSong,
      })
      .code(201);
  }

  async getSongInPlaylist(req, h) {
    const { id: playlistId } = req.params;
    const playlistSong = await this._playlistSongService.getSongInPlaylist(
      playlistId
    );
    return h.response({
      status: 'success',
      message: 'Song retrieved successfully',
      data: playlistSong,
    });
  }

  async removeSongFromPlaylist(req, h) {
    const { id: playlistId } = req.params;
    const { id: songId } = req.payload;
    const deleteId = await this._playlistSongService.removeSongFromPlaylist(
      playlistId,
      songId
    );
    return h.response({
      status: 'success',
      message: 'Song deleted successfully',
      data: deleteId,
    });
  }
}

module.exports = PlaylistSongsHandler;
