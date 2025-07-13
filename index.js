#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const XArchiveParser = require('./parser');
const ExcelExporter = require('./exporter');

function showUsage() {
  console.log(`
X Archive Parser - Convert X/Twitter archive to Excel

Usage:
  node index.js <archive-path> [output-file]

Arguments:
  archive-path    Path to X archive directory or tweets.js file
  output-file     Output Excel file path (optional, defaults to tweets.xlsx)

Examples:
  node index.js ./twitter-archive/data/js/tweets/
  node index.js ./tweets.js my-tweets.xlsx
  node index.js ./twitter-archive/ export.xlsx

The tool will automatically find all tweets*.js files in the specified directory.
  `);
}

function validatePath(inputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Path "${inputPath}" does not exist`);
    return false;
  }
  return true;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  const archivePath = args[0];
  const outputFile = args[1] || 'tweets.xlsx';

  // Validate input path
  if (!validatePath(archivePath)) {
    process.exit(1);
  }

  console.log('🐦 X Archive Parser');
  console.log('==================');
  console.log(`Input: ${archivePath}`);
  console.log(`Output: ${outputFile}`);
  console.log('');

  // Initialize parser
  const parser = new XArchiveParser();

  try {
    const stats = fs.statSync(archivePath);

    if (stats.isDirectory()) {
      console.log('📁 Processing directory...');
      if (!parser.parseDirectory(archivePath)) {
        console.error('Failed to parse directory');
        process.exit(1);
      }
    } else if (stats.isFile()) {
      console.log('📄 Processing file...');
      if (!parser.parseFile(archivePath)) {
        console.error('Failed to parse file');
        process.exit(1);
      }
      console.log(`Total tweets parsed: ${parser.getTweets().length}`);
    } else {
      console.error('Error: Input path is neither a file nor a directory');
      process.exit(1);
    }

    const tweets = parser.getProcessedTweets();

    if (tweets.length === 0) {
      console.log('⚠️  No tweets found in the archive');
      process.exit(0);
    }

    console.log('');
    console.log('📊 Tweet Statistics:');
    console.log(`   Total tweets: ${tweets.length}`);
    console.log(
      `   Original tweets: ${tweets.filter(t => !t.isRetweet && !t.inReplyTo).length}`
    );
    console.log(`   Retweets: ${tweets.filter(t => t.isRetweet).length}`);
    console.log(`   Replies: ${tweets.filter(t => t.inReplyTo).length}`);
    console.log(
      `   Total likes: ${tweets.reduce((sum, t) => sum + t.favoriteCount, 0)}`
    );
    console.log(
      `   Total retweets: ${tweets.reduce((sum, t) => sum + t.retweetCount, 0)}`
    );

    console.log('');
    console.log('📈 Exporting to Excel...');

    // Export to Excel
    const exporter = new ExcelExporter();
    if (exporter.exportTweets(tweets, outputFile)) {
      console.log('');
      console.log('✅ Export completed successfully!');
      console.log(`📄 File saved: ${path.resolve(outputFile)}`);

      // Show file size
      const fileStats = fs.statSync(outputFile);
      const fileSizeKB = Math.round(fileStats.size / 1024);
      console.log(`📏 File size: ${fileSizeKB} KB`);
    } else {
      console.error('❌ Export failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

main();
