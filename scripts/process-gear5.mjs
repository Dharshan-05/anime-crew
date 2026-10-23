import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  
  const raw = fs.readFileSync('C:\\Users\\Dharshan\\Downloads\\5gear.png');
  const b64 = raw.toString('base64');
  
  const pngBase64 = await page.evaluate(async (dataUri) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        const w = c.width;
        const h = c.height;
        
        // Flood fill from all perimeter boundary pixels
        const visited = new Uint8Array(w * h);
        const queue = [];
        
        // Push all border pixels to queue
        for (let x = 0; x < w; x++) {
          queue.push(x); // top row
          queue.push((h - 1) * w + x); // bottom row
          visited[x] = 1;
          visited[(h - 1) * w + x] = 1;
        }
        for (let y = 0; y < h; y++) {
          const idx1 = y * w;
          const idx2 = y * w + w - 1;
          if (!visited[idx1]) { visited[idx1] = 1; queue.push(idx1); }
          if (!visited[idx2]) { visited[idx2] = 1; queue.push(idx2); }
        }
        
        let qHead = 0;
        while (qHead < queue.length) {
          const idx = queue[qHead++];
          const x = idx % w;
          const y = Math.floor(idx / w);
          
          const p = idx * 4;
          const r = d[p], g = d[p+1], b = d[p+2];
          
          // Outer background is white/near-white (threshold > 235)
          // Stop at black/dark outlines or character colors
          if (r > 235 && g > 235 && b > 235) {
            d[p+3] = 0; // Make transparent
            
            // 4-way neighbors
            if (x > 0) {
              const n = idx - 1;
              if (!visited[n]) { visited[n] = 1; queue.push(n); }
            }
            if (x < w - 1) {
              const n = idx + 1;
              if (!visited[n]) { visited[n] = 1; queue.push(n); }
            }
            if (y > 0) {
              const n = idx - w;
              if (!visited[n]) { visited[n] = 1; queue.push(n); }
            }
            if (y < h - 1) {
              const n = idx + w;
              if (!visited[n]) { visited[n] = 1; queue.push(n); }
            }
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(c.toDataURL('image/png').split(',')[1]);
      };
      img.src = dataUri;
    });
  }, 'data:image/jpeg;base64,' + b64);
  
  fs.writeFileSync('public/assets/luffy-gear5.png', Buffer.from(pngBase64, 'base64'));
  console.log('Saved public/assets/luffy-gear5.png, size:', fs.statSync('public/assets/luffy-gear5.png').size);
  
  await browser.close();
}

main().catch(console.error);
