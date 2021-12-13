const { Pool } = require('pg');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllSongByUserId(userId) {
    const query = {
      text: `SELECT songs.* FROM songs
      LEFT JOIN playlistsongs ON playlistsongs.song_id = songs.id
      LEFT JOIN playlists ON playlists.id = playlistsongs.playlist_id
      WHERE playlists.user_id = $1`,
      values: [userId],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = SongService;
