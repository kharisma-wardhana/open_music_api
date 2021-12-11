const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsHandler {
  constructor(
    playlistService,
    playlistSongService,
    collaborationService,
    validator
  ) {
    this._playlistService = playlistService;
    this._playlistSongService = playlistSongService;
    this._collaborationService = collaborationService;
    this._validator = validator;

    this.addSongToPlaylistHandler = this.addSongToPlaylist.bind(this);
    this.getSongInPlaylistHandler = this.getSongInPlaylist.bind(this);
    this.removeSongFromPlaylistHandler = this.removeSongFromPlaylist.bind(this);
  }

  async addSongToPlaylist(req, h) {
    const { playlistId } = req.params;
    const { songId } = req.payload;
    const { id: userId } = req.auth.credentials;

    await this.validateAccess(playlistId, userId);

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
    const { playlistId } = req.params;
    const { id: userId } = req.auth.credentials;

    await this.validateAccess(playlistId, userId);

    const playlistSong = await this._playlistSongService.getSongInPlaylist(
      playlistId
    );

    return h.response({
      status: 'success',
      message: 'Song retrieved successfully',
      data: {
        songs: playlistSong,
      },
    });
  }

  async removeSongFromPlaylist(req, h) {
    const { playlistId } = req.params;
    const { songId } = req.payload;
    const { id: userId } = req.auth.credentials;

    await this.validateAccess(playlistId, userId);

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

  async validateAccess(playlistId, userId) {
    try {
      await this._playlistService.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaboration(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongsHandler;
