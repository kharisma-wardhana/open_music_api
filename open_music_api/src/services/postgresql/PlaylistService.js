const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT user_id FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist not found');
    }
    const playlistUserId = rows[0].user_id;
    if (playlistUserId !== userId) {
      throw new AuthorizationError('Unauthorized access');
    }
  }

  async validateAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
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

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists LEFT JOIN users ON playlists.user_id = users.id
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id 
      WHERE playlists.user_id = $1 OR collaborations.user_id = $1`,
      values: [userId],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async createPlaylist(playlist) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists (id, user_id, name) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlist.userId, playlist.name],
    };
    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Playlist not created');
    }
    return rows[0].id;
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Playlist not found');
    }
    return rowCount;
  }
}

module.exports = PlaylistService;
