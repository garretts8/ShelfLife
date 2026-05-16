//Handles sending email notifications using NodeMailer 
const nodemailer = require('nodemailer');
const { getExpirationAlertTemplate, getTestEmailTemplate } = require('./emailTemplates');

//Create email transporter. Uses Gmail service 
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, //Gmail username
            // Gmail app Password
            pass: process.env.EMAIL_PASS
        }
    });
}

//Build HTML table rows for expiring items
const buildItemsListHtml = (expiringItems) => {
    return expiringItems.map(item => {
        const expDate = new Date(item.expirationDate).toLocaleDateString();
        return `
            <tr>
            <td>${item.name}</td>
            <td>${item.quantity} ${item.unit}</td>
            <td class="expiry-date">${expDate}</td>
            </tr>
        `;
    }).join('')
};

//Send expiration notifications email
const sendExpirationAlert = async (userEmail, userName, expiringItems) => {
    try {
        const transporter = createTransporter();
        const itemsListHtml = buildItemsListHtml(expiringItems);
        const htmlContent = getExpirationAlertTemplate(userName, itemsListHtml);
        const mailOptions = {
            from: `"ShelfLife" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `⚠️ ${expiringItems.length} Item(s) Expiring Soon in Your Pantry`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}: ${info.messageId}`);
        return true;

    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

//Send test email for verification
const sendTestEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();
        const htmlContent = getTestEmailTemplate(userName);

        const mailOptions = {
            from: `"ShelfLife" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'ShelfLife Email Notifications Enabled',
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Test Email sent to ${userEmail}`);
        return true;

    } catch (error) {
        console.error('Error sending test email:', error);
        return false;
    }
};

module.exports = {
    sendExpirationAlert,
    sendTestEmail
};