const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name;
    this.url = url || "";
    this.from = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(template, subject, data) {
    const templateOptions = {
      firstName: this.firstName,
      url: this.url,
      subject: subject,
    };
    if (data) {
      templateOptions.data = data;
    }
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      templateOptions
    );

    const mailOptions = {
      from: this.from, // Sender address
      to: this.to, // List of receivers
      subject: subject, // Subject line
      // Text: message, // Plain text body
      html: html, // Html body
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      "welcome",
      "Te has registrado en Amerilancers exitosamente"
    );
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Has solicitado restablecer la contraseña"
    );
  }

  async sendContactFormMessage(data) {
    await this.send(
      "contactFormMessage",
      "Has recibido un mensaje del formulario",
      data
    );
  }

  async sendNewUserNotification(data) {
    await this.send(
      "newMemberNotification",
      "Se ha registrado un nuevo usuario!",
      data
    );
  }

  async sendNewMessageNotification(data) {
    await this.send(
      "newMessageNotification",
      "Has recibido un mensaje en Amerilancers!",
      data
    );
  }
};
