require('dotenv').config();

const amqp = require('amqplib');
const MailSender = require('./utils/MailSender');
const NotifListener = require('./services/rabbitmq/NotifListener');

const init = async () => {
  const mailSender = new MailSender();
  const notifListener = new NotifListener(mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue(process.env.NOTIF_QUEUE, { durable: true });

  channel.consume(process.env.NOTIF_QUEUE, notifListener.sendNotif, {
    noAck: true,
  });
};

init();
