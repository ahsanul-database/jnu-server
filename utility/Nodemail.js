const nodemailer = require("nodemailer");

const sendMail = (
  title,
  courseTeacher,
  course,
  description,
  date,
  time,
  room,
  studentMails
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: "587",
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "cr.csejnu@gmail.com",
      pass: process.env.EMAIl_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  const options = {
    from: "cr.csejnu@gmail.com",
    to: studentMails,
    subject: title,
    html: `
      <p> ${description}</p>
      <br />
      <p>This will coducted by ${courseTeacher}</p>
      <p>Date:  ${date} </p>
      <p>Time:  ${time} </p>
      <p>Room No.: ${room} </p>
            <br />
      <p>Regards</p>
      <small>CR, CSE JNU,Batch-Ambiguity</small>

    `,
  };
  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendMail;
