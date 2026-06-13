// Handles sending email notifications using Brevo SMTP (works on Render)
const nodemailer = require('nodemailer');
const { getExpirationAlertTemplate, getTestEmailTemplate } = require('./emailTemplates');

// Create email transporter using Brevo SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });
};

// Build HTML table rows for expiring items
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
    }).join('');
};

// Send expiration notification email
const sendExpirationAlert = async (userEmail, userName, expiringItems) => {
    try {
        const transporter = createTransporter();
        
        // Verify connection before sending
        await transporter.verify();
        
        const itemsListHtml = buildItemsListHtml(expiringItems);
        const htmlContent = getExpirationAlertTemplate(userName, itemsListHtml);
        
        const mailOptions = {
            from: `"ShelfLife" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `⚠️ ${expiringItems.length} Item(s) Expiring Soon in Your Pantry`,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending expiration alert:', error);
        return false;
    }
};

// Send test email
const sendTestEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();
        
        // Verify connection before sending
        await transporter.verify();
        
        const htmlContent = getTestEmailTemplate(userName);
        
        const mailOptions = {
            from: `"ShelfLife" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'ShelfLife Email Notifications Enabled',
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Test email sent to ${userEmail}`);
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