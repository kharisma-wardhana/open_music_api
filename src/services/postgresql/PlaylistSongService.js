const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongInPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
      LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id 
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Empty playlist');
    }
    return rows;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Playlist song not added');
    }
    return rows[0].id;
  }

  async removeSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Unable to remove song from playlist');
    }
    return rowCount;
  }
}

module.exports = PlaylistSongService;
