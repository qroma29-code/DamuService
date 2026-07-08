import { PrismaClient } from '@prisma/client';
import express, { type Request, type Response } from 'express';

const prisma = new PrismaClient();
const app = express();
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
app.use(express.json());
app.post('/api/users', async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    try {
        const client = await prisma.client.create({ data: { name, phone } });
        res.json(client);
    } catch (e) {
        res.status(400).json({ error: 'Клиент с таким номером телефона уже существует' });
    }
});
app.get('/api/clients', async (_req: Request, res: Response) => {
    const clients = await prisma.client.findMany();
    res.json(clients);
});
app.post('/api/orders', async (req: Request, res: Response) => {
    const { device, description, price, clientId } = req.body;
    const order = await prisma.order.create({
        data: { device, description, price: parseFloat(price), clientId: parseInt(clientId) }
    });
    res.json(order);
});
app.get('/api/orders', async (_req: Request, res: Response) => {
    const orders = await prisma.order.findMany({ include: { client: true } });
    res.json(orders);
});
app.put('/api/orders/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, price } = req.body;
    const order = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status, price: price ? parseFloat(price) : undefined }
    });
    res.json(order);
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
