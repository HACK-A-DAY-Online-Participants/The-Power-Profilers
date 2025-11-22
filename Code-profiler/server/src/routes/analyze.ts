import { Router } from 'express';
import { runAnalysis } from '../lib/analyzerBridge';


const router = Router();


router.post('/', async (req, res) => {
const { code, language } = req.body;
if (!code || !language) return res.status(400).json({ error: 'code and language required' });


try {
const result = await runAnalysis(code, language);
return res.json(result);
} catch (err) {
console.error('Analysis failed', err);
return res.status(500).json({ error: 'Analysis failed' });
}
});


export default router;