let moment = require("moment");
let mysql = require('mysql');
let mysqlQuery = require("../../config/mysql-query");
let mysqlDB = mysqlQuery.db;
let conn = mysql.createConnection(mysqlDB);
conn.connect();

module.exports = {
    name: 'cache-message-history',
    description: "Retrieves message history for the current channel and stores it to the DB",
    execute: async function (client, message, args) {

        let guild = {
            id: message.guild.id,
            name: message.guild.name,
        }
        let channel = {
            id: message.channel.id,
            guild: guild.id,
            name: message.channel.name,
        }
        conn.query(`INSERT INTO guilds SET ? ON DUPLICATE KEY UPDATE ?`, [guild, guild], (error, result, fields) => {
            if (error) throw error;
            console.log("successfully inserted guild");
        });
        conn.query(`INSERT INTO channels SET ? ON DUPLICATE KEY UPDATE ?`, [channel, channel], (error, result, fields) => {
            if (error) throw error;
            console.log("successfully inserted channel");
        });
        let messageCount = 0;
        console.log(`Retrieving list of messages...`);

        let messages = await message.channel.messages.fetch({limit: 100});

        while (messages.size === 100) {
            messageCount += messages.size;
            let last = messages.last().id;

            for (let historical_message of messages.values()) {
                //todo: fix this datetime (it is like 4 years early?)
                let message_timestamp = (historical_message.id >> 22) + 1420070400000;

                //insert into DB for author
                let author = {
                    id: historical_message.author.id,
                    nickname: client.guilds.cache.get(historical_message.guild.id).member(historical_message.author.id) || "NULL",
                }
                await conn.query(`INSERT INTO users SET ? ON DUPLICATE KEY UPDATE ?`, [author, author], (error, results, fields) => {
                    if (error) {
                        console.log("mysql insert of message failed");
                        throw error;
                    }
                    console.log("inserted message successfully");
                });

                //insert into DB for message
                let post = {
                    id: historical_message.id,
                    author: historical_message.author.id,
                    guild: guild.id,
                    channel: channel.id,
                    content: historical_message.content,
                    timestamp: message_timestamp,
                }

                //debug
                console.log(`Adding message to db: ${post.id}`);
                console.log(`Message Timestamp: ${moment(post.timestamp).format("LLLL")}`);
                console.log(`Guild ID: ${guild.id}`);
                console.log(`Author ID: ${author.id}`);
                console.log(`Author Nick: ${author.nickname}`);

                await conn.query(`INSERT INTO messages SET ? ON DUPLICATE KEY UPDATE ?`, [post, post], (error, results, fields) => {
                    if (error) {
                        console.log("mysql insert of message failed");
                        throw error;
                    }
                    console.log("inserted message successfully");
                });
            }
            messages = await message.channel.messages.fetch({limit: 100, before: last});
        }

        messageCount += messages.size;

        message.channel.send(`There have been ${messageCount} messages sent in this channel.`);
        conn.query("SELECT COUNT(*) FROM `messages`",(err,result,fields) => {
            message.reply(`Updated mysql query successfully.  Rows: ${JSON.stringify(result)}`);
        });
    }
}