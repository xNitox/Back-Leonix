
import express from 'express';
import cors from 'cors';
import router from './routes/product.sale.route.js';
import routerRole from './routes/role.route.js';
import createStaffRoute from './routes/createStaff.route.js';
import rutaRegisterCommerce from './routes/registerBussiness.route.js';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/', router);
app.use('/api/', routerRole);
app.use('/api',createStaffRoute);
app.use('/api', rutaRegisterCommerce)
app.listen(PORT,()=>{
    console.log(`Backend running on http://localhost:${PORT}`)
});