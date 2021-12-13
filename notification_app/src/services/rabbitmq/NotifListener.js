class NotifListener {
  constructor(songService, mailSender) {
    this._songService = songService;
    this._mailSender = mailSender;

    this.sendNotif = this.sendNotif.bind(this);
  }

  async sendNotif(message) {
    try {
      const { userId, targetEmail } = JSON.parse(message.content.toString());

      const songs = await this._songService.getAllSongByUserId(userId);
      const result = await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(songs)
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = NotifListener;
