// Handles SMS notifications (with test mode for demonstration)
const sendSMS = async (toNumber, message) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderName = process.env.BREVO_SMS_SENDER || 'ShelfLife';
    const testMode = process.env.SMS_TEST_MODE === 'true';

    if (testMode) {
        // Log what WOULD be sent (for demonstration)
        console.log('📱 [TEST MODE] SMS would be sent:');
        console.log(`   To: ${toNumber}`);
        console.log(`   From: ${senderName}`);
        console.log(`   Message: ${message.substring(0, 100)}...`);
        return true;  // Simulate success
    }

    // Real SMS sending (requires credits)
    if (!apiKey) {
        console.error('Missing BREVO_API_KEY environment variable');
        return false;
    }

    const payload = {
        type: 'transactional',
        sender: senderName,
        recipient: toNumber,
        content: message.substring(0, 160)
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Brevo SMS API error:', result);
            return false;
        }

        console.log(`📱 SMS sent to ${toNumber}: ${result.messageId}`);
        return true;
    } catch (error) {
        console.error('SMS sending error:', error);
        return false;
    }
};

module.exports = { sendSMS };