// Scheduled job to check for expiring items and send notifications
const cron = require('node-cron');
const PantryItem = require('../models/PantryItem');
const User = require('../models/User');
const { sendExpirationAlert } = require('./emailService');

// Function to check expiring items and send emails
const checkAndNotifyExpiringItems = async () => {
    console.log('Running expiration check cron job...', new Date().toLocaleString());

    try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // Set time boundaries
        today.setUTCHours(0, 0, 0, 0);
        nextWeek.setUTCHours(23, 59, 59, 999);

        // Query the database to find all expiring items (within next 7 days)
        const expiringItems = await PantryItem.find({
            expirationDate: {
                $gte: today,
                $lte: nextWeek
            }
        }).populate('user');

        if (expiringItems.length === 0) {
            console.log('No expiring items found.');
            return;
        }

        console.log(`Found ${expiringItems.length} expiring item(s)`);

        // Group expiring items by user
        const itemsByUser = {};
        for (const item of expiringItems) {
            const userId = item.user._id.toString();
            if (!itemsByUser[userId]) {
                itemsByUser[userId] = {
                    user: item.user,
                    items: []
                };
            }
            itemsByUser[userId].items.push(item);
        }
        //If multiple users have expiring items, create individual itemsByUser objects
        //Send ONE email to each user with ALL their expiring items. 
        for (const userId of Object.keys(itemsByUser)) {
            const { user, items } = itemsByUser[userId];

            if (user.email) {
                console.log(`Sending email to ${user.email} (${items.length} items expiring)`);
                await sendExpirationAlert(user.email, user.name, items);
            }
        }

        console.log('Expiration check completed successfully.');

    } catch (error) {
        console.error('Error in expiration check cron job:', error);
    }
};

// Initialize cron jobs
const initCronJobs = () => {
    // This line sets up the daily schedule for the cron job. 
    // The job will run every day at 9:00 AM.
    // cron syntax: minute hour day-of-month month day-of-week
    const job = cron.schedule('0 9 * * *', () => {
        console.log('--- Running scheduled expiration check ---');
        checkAndNotifyExpiringItems();
    });

    console.log('Cron job scheduled: Daily expiration check at 9:00 AM');

    //Run once on startup to catch any missed items
    console.log('Running initial expiration check on startup...');
    setTimeout(() => {
        checkAndNotifyExpiringItems();
        //Wait 5 seconds for server to fully start
    }, 5000);

    return job;
};

module.exports = {
    checkAndNotifyExpiringItems,
    initCronJobs
};