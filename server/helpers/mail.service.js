const sendgrid = require('sendgrid');
const config = require('../../config/config');
const mailTemplateGenerator = require('./recoverPasswordTemplateGenerator');

const sgHelper = sendgrid.mail;
const sgSender = sendgrid(config.sendgridApiKey);

const DEFAULT_CONTATC_EMAIL = 'contato@googolapp.site';
const PASSWORD_RECOVERY_SUBJECT = 'Recuperação de Senha';

const sendMail = (from, to, subject, content, contentType = 'text/html') => {
  const fromEmail = new sgHelper.Email(from);
  const toEmail = new sgHelper.Email(to);
  const contentEmail = new sgHelper.Content(contentType, content);
  const email = new sgHelper.Mail(fromEmail, subject, toEmail, contentEmail);

  const request = sgSender.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: email.toJSON(),
  });

  return sgSender.API(request);
};

const sendPasswordRecoveryEmail = (username, userEmail, token) => {
  const template = mailTemplateGenerator.generateTemplate(username, token);
  return sendMail(DEFAULT_CONTATC_EMAIL, userEmail, PASSWORD_RECOVERY_SUBJECT, template);
}

module.exports = { sendMail, sendPasswordRecoveryEmail };