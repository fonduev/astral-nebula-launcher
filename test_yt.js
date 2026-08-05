const https = require('https');

function searchYouTube(query) {
  return new Promise((resolve) => {
    const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' audio oficial');
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const matches = [];
          const videoBlocks = data.split('"videoRenderer":');
          for (let i = 1; i < videoBlocks.length && matches.length < 15; i++) {
            const block = videoBlocks[i];
            const idMatch = block.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
            const titleMatch = block.match(/"title":\{"runs":\[\{"text":"([^"]+)"/);
            const ownerMatch = block.match(/"ownerText":\{"runs":\[\{"text":"([^"]+)"/);
            const lengthMatch = block.match(/"lengthText":\{[^}]*"simpleText":"([^"]+)"/);

            if (idMatch) {
              matches.push({
                videoId: idMatch[1],
                title: titleMatch ? titleMatch[1] : query,
                artist: ownerMatch ? ownerMatch[1] : 'YouTube Music',
                durationText: lengthMatch ? lengthMatch[1] : '3:30'
              });
            }
          }
          console.log('Found full YouTube videos:', matches.length);
          if (matches.length) {
            console.log('Track #1:', matches[0].title, '| by:', matches[0].artist, '| duration:', matches[0].durationText, '| ID:', matches[0].videoId);
          }
          resolve(matches);
        } catch(e) { console.error('Parse error:', e); resolve([]); }
      });
    }).on('error', (e) => { console.error('HTTP error:', e); resolve([]); });
  });
}

searchYouTube('duki');
