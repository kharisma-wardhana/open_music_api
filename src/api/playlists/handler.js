class PlaylistsHandler {
  constructor(playlistService, validator) {
    this._playlistService = playlistService;
    this._validator = validator;

    this.createPlaylistHandler = this.createPlaylist.bind(this);
    this.getPlaylistsHandler = this.getUserPlaylist.bind(this);
    this.deletePlaylistHandler = this.deleteUserPlaylist.bind(this);
  }

  async createPlaylist(req, h) {
    this._validator.validatePlaylistPayload(req.payload);
    const { name } = req.payload;
    const { id: userId } = req.auth.credentials;
    const playlist = await this._playlistService.createPlaylist({
      name,
      userId,
    });
    return h
      .response({
        status: 'success',
        message: 'Playlist created successfully',
        data: { playlistId: playlist },
      })
      .code(201);
  }

  async getUserPlaylist(req, h) {
    const { id: userId } = req.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(userId);
    return h.response({
      status: 'success',
      message: 'Playlists retrieved successfully',
      data: {
        playlists,
      },
    });
  }

  async deleteUserPlaylist(req, h) {
    const { id: playlistId } = req.params;
    const { id: userId } = req.auth.credentials;
    await this._playlistService.verifyPlaylistUser(playlistId, userId);
    await this._playlistService.deletePlaylist(playlistId);
    return h.response({
      status: 'success',
      message: 'Playlist deleted successfully',
    });
  }
}

module.exports = PlaylistsHandler;
