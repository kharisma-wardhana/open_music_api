class NotifListener {
  constructor(mailSender) {
    this._mailSender = mailSender;

    this.sendNotif = this.sendNotif.bind(this);
  }

  async sendNotif(message) {
    try {
      const { targetEmail, songs } = JSON.parse(message.content.toString());
      console.log(`Received songs data : ${songs}`);
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
