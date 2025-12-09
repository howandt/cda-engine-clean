import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'CDT', 'data', 'CDT_emotionmotor.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error reading emotionmotor:', error);
    res.status(500).json({ error: 'Failed to load emotionmotor' });
  }
}