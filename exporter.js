const XLSX = require('xlsx');

class ExcelExporter {
  constructor() {
    this.workbook = XLSX.utils.book_new();
  }

  exportTweets(tweets, outputPath) {
    try {
      // Main tweets worksheet
      this.createTweetsWorksheet(tweets);

      // Summary statistics worksheet
      this.createSummaryWorksheet(tweets);

      // Hashtags analysis worksheet
      this.createHashtagsWorksheet(tweets);

      // Write the workbook
      XLSX.writeFile(this.workbook, outputPath);
      console.log(`Excel file exported successfully: ${outputPath}`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error.message);
      return false;
    }
  }

  createTweetsWorksheet(tweets) {
    const worksheetData = [
      [
        'Tweet ID',
        'Date',
        'Time',
        'Tweet Text',
        'Retweets',
        'Likes',
        'Language',
        'Hashtags',
        'Mentions',
        'URLs',
        'Source',
        'Is Retweet',
        'Reply To',
        'Coordinates',
        'Place'
      ]
    ];

    tweets.forEach(tweet => {
      const date = tweet.createdAt;
      worksheetData.push([
        tweet.id,
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        tweet.text,
        tweet.retweetCount,
        tweet.favoriteCount,
        tweet.language,
        tweet.hashtags,
        tweet.mentions,
        tweet.urls,
        tweet.source,
        tweet.isRetweet ? 'Yes' : 'No',
        tweet.inReplyTo,
        tweet.coordinates,
        tweet.place
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Tweet ID
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 50 }, // Tweet Text
      { wch: 10 }, // Retweets
      { wch: 10 }, // Likes
      { wch: 8 }, // Language
      { wch: 30 }, // Hashtags
      { wch: 30 }, // Mentions
      { wch: 40 }, // URLs
      { wch: 20 }, // Source
      { wch: 10 }, // Is Retweet
      { wch: 20 }, // Reply To
      { wch: 20 }, // Coordinates
      { wch: 20 } // Place
    ];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Tweets');
  }

  createSummaryWorksheet(tweets) {
    const totalTweets = tweets.length;
    const totalRetweets = tweets.filter(t => t.isRetweet).length;
    const totalReplies = tweets.filter(t => t.inReplyTo).length;
    const totalOriginal = totalTweets - totalRetweets - totalReplies;

    const totalLikes = tweets.reduce((sum, t) => sum + t.favoriteCount, 0);
    const totalRTs = tweets.reduce((sum, t) => sum + t.retweetCount, 0);

    const languages = {};
    tweets.forEach(t => {
      if (t.language) {
        languages[t.language] = (languages[t.language] || 0) + 1;
      }
    });

    const dateRange = this.getDateRange(tweets);

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Tweets', totalTweets],
      ['Original Tweets', totalOriginal],
      ['Retweets', totalRetweets],
      ['Replies', totalReplies],
      ['Total Likes Received', totalLikes],
      ['Total Retweets Received', totalRTs],
      ['Date Range', `${dateRange.start} to ${dateRange.end}`],
      [''],
      ['Top Languages', ''],
      ...Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([lang, count]) => [lang, count])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Summary');
  }

  createHashtagsWorksheet(tweets) {
    const hashtagCounts = {};

    tweets.forEach(tweet => {
      if (tweet.hashtags) {
        const hashtags = tweet.hashtags.split(', ').filter(h => h.trim());
        hashtags.forEach(hashtag => {
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        });
      }
    });

    const hashtagData = [['Hashtag', 'Count', 'Percentage']];

    const totalHashtags = Object.values(hashtagCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .forEach(([hashtag, count]) => {
        const percentage = ((count / totalHashtags) * 100).toFixed(2);
        hashtagData.push([hashtag, count, `${percentage}%`]);
      });

    const worksheet = XLSX.utils.aoa_to_sheet(hashtagData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 12 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Hashtags');
  }

  getDateRange(tweets) {
    if (tweets.length === 0) return { start: 'N/A', end: 'N/A' };

    const dates = tweets.map(t => t.createdAt).sort((a, b) => a - b);
    return {
      start: dates[0].toLocaleDateString(),
      end: dates[dates.length - 1].toLocaleDateString()
    };
  }
}

module.exports = ExcelExporter;
