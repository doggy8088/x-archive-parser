const fs = require('fs');
const path = require('path');

class XArchiveParser {
  constructor() {
    this.tweets = [];
  }

  parseFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Remove the JavaScript wrapper
      let jsonContent = content;
      if (content.startsWith('window.YTD.')) {
        const equalIndex = content.indexOf('=');
        if (equalIndex !== -1) {
          jsonContent = content.substring(equalIndex + 1).trim();
        }
      }

      // Parse JSON
      const data = JSON.parse(jsonContent);

      // Extract tweets from the array
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.tweet) {
            this.tweets.push(item.tweet);
          }
        });
      }

      return true;
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error.message);
      return false;
    }
  }

  parseDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      const tweetFiles = files.filter(
        file => file.startsWith('tweets') && file.endsWith('.js')
      );

      console.log(`Found ${tweetFiles.length} tweet files`);

      tweetFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        console.log(`Parsing ${file}...`);
        this.parseFile(filePath);
      });

      console.log(`Total tweets parsed: ${this.tweets.length}`);
      return true;
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error.message);
      return false;
    }
  }

  getTweets() {
    return this.tweets;
  }

  processTweetData(tweet) {
    return {
      id: tweet.id_str || tweet.id,
      text: tweet.full_text || tweet.text || '',
      createdAt: new Date(tweet.created_at),
      retweetCount: parseInt(tweet.retweet_count) || 0,
      favoriteCount: parseInt(tweet.favorite_count) || 0,
      language: tweet.lang || '',
      hashtags: tweet.entities?.hashtags?.map(h => h.text).join(', ') || '',
      mentions:
        tweet.entities?.user_mentions
          ?.map(m => `@${m.screen_name}`)
          .join(', ') || '',
      urls:
        tweet.entities?.urls?.map(u => u.expanded_url || u.url).join(', ') ||
        '',
      source: this.extractSource(tweet.source),
      isRetweet: tweet.retweeted || false,
      inReplyTo: tweet.in_reply_to_status_id_str || '',
      coordinates: tweet.coordinates
        ? `${tweet.coordinates.coordinates[1]}, ${tweet.coordinates.coordinates[0]}`
        : '',
      place: tweet.place?.full_name || ''
    };
  }

  extractSource(source) {
    if (!source) return '';
    // Remove HTML tags from source
    return source.replace(/<[^>]*>/g, '');
  }

  getProcessedTweets() {
    return this.tweets.map(tweet => this.processTweetData(tweet));
  }
}

module.exports = XArchiveParser;
