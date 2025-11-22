import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import analyzeRouter from './routes/analyze';


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));


app.use('/analyze', analyzeRouter);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🔥 Code Profiler API listening on http://localhost:${port}`));