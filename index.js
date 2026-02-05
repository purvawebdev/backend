require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
// Store file in memory RAM so we can attach it directly
const upload = multer({ storage: multer.memoryStorage() });

// Allow your frontend to talk to this server
app.use(cors());

// 1. Gmail Auth (Simple SMTP with App Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// 2. The API Endpoint
app.post('/send-certificate', upload.single('pdf'), async (req, res) => {
    try {
        const file = req.file; // Multer grabs the file buffer here
        const { email, name } = req.body; // Text fields come here

        if (!file || !email) {
            return res.status(400).json({ error: 'Missing file or email' });
        }

        console.log(`Processing: ${name} (${email})`);

        // 3. Send Email with Attachment
        const mailOptions = {
            from: `"Gryphon Academy" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Certificate of Appreciation - Gryphon Academy Training`,
            html: `
        <div style="font-family: sans-serif; padding: 0; margin: 0; max-width: 600px;">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>We are thrilled to present you with your <strong>digital certificate</strong> in recognition of your successful completion of the training program at <strong>Gryphon Academy</strong>. This certificate is a testament to your skills and expertise, which you have diligently cultivated during your time with us.</p>
          
          <p>We believe that this accomplishment will serve as a stepping stone toward a brighter and more promising future in your chosen field. The skills you've gained will not only open doors to new opportunities but also empower you to stand out in a competitive job market.</p>
          
          <p>Wishing you all the best in your future endeavors!</p>
          
          <p style="margin-top: 30px;">
            Warm regards,<br>
            <strong>Gryphon Academy Team</strong>
          </p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">Please find your certificate attached to this email.</p>
        </div>
      `,
            attachments: [
                {
                    filename: `${name}_Certificate.pdf`,
                    content: file.buffer, // Attach buffer directly
                    contentType: 'application/pdf',
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Sent to ${email}`);

        res.json({ success: true, message: 'Certificate sent successfully!' });

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});