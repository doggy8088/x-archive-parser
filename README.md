# X Archive Parser

A Node.js tool to parse X (Twitter) archive files and export tweets to Excel format with detailed analytics.

## Features

- ✅ Parse X/Twitter archive JSON files
- 📊 Export to Excel with multiple worksheets
- 📈 Generate tweet statistics and analytics
- 🏷️ Hashtag usage analysis
- 🌍 Language distribution tracking
- 📱 Source application tracking
- 🗺️ Location data extraction

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Command Line Interface

```bash
node index.js <archive-path> [output-file]
```

**Arguments:**

- `archive-path`: Path to X archive directory or tweets.js file
- `output-file`: Output Excel file path (optional, defaults to tweets.xlsx)

### Examples

```bash
# Parse entire archive directory
node index.js ./twitter-archive/data/js/tweets/

# Parse single tweets file
node index.js ./tweets.js my-tweets.xlsx

# Parse with custom output filename
node index.js ./twitter-archive/ export.xlsx
```

### Getting Your X Archive

1. Go to X.com → Settings → Your Account → Download an archive of your data
2. Wait for the archive to be generated (can take 24-48 hours)
3. Download and extract the ZIP file
4. Navigate to `data/js/tweets/` directory in the extracted archive

## Output Format

The tool generates an Excel file with multiple worksheets:

### 1. Tweets Sheet

Contains all tweet data with columns:

- Tweet ID, Date, Time
- Tweet Text
- Retweets, Likes
- Language
- Hashtags, Mentions, URLs
- Source, Is Retweet, Reply To
- Coordinates, Place

### 2. Summary Sheet

Provides overall statistics:

- Total tweets, retweets, replies
- Total engagement (likes/retweets received)
- Date range
- Top languages used

### 3. Hashtags Sheet

Hashtag analysis with:

- Most used hashtags
- Usage counts and percentages
- Top 100 hashtags

## Supported Archive Formats

The tool handles X archive files in the format:

```javascript
window.YTD.tweet.part0 = [
  {
    tweet: {
      id_str: '...',
      full_text: '...',
      created_at: '...'
      // ... other fields
    }
  }
];
```

The JavaScript wrapper is automatically removed during parsing.

## Requirements

- Node.js 12.0 or higher
- X/Twitter archive file(s)

## Dependencies

- `xlsx`: Excel file generation and manipulation

## File Structure

```
x-archive-parser/
├── index.js          # Main CLI application
├── parser.js          # X archive parser module
├── exporter.js        # Excel export functionality
├── package.json       # Project configuration
└── README.md          # This file
```

## Error Handling

The tool includes comprehensive error handling for:

- Invalid file paths
- Malformed JSON files
- Missing archive files
- File system permissions
- Memory limitations for large archives

## Troubleshooting

**Q: "No tweets found in the archive"**

- Ensure you're pointing to the correct directory containing tweets\*.js files
- Check that the files aren't empty or corrupted

**Q: "Failed to parse file"**

- The tweet files might be malformed or use a different format
- Try parsing individual files to identify problematic ones

**Q: Excel file is very large**

- Large archives (100k+ tweets) can generate large Excel files
- Consider filtering tweets by date range if needed

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the tool.

## License

ISC License
