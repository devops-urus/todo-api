// In src/index.ts
import express from 'express';
// CHANGE HERE: Import types explicitly with `import type`
import type { Request, Response } from 'express';
import prisma from './client';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running successfully!' });
});

// CREATE a new todo
app.post('/todos', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text field is required' });
    }
    const newTodo = await prisma.todo.create({
      data: { text: text },
    });
    res.status(201).json(newTodo);
  } catch (err) {
    // CHANGE HERE: Safely handle the 'unknown' error type
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

// GET all todos
app.get('/todos', async (req: Request, res: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(todos);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

// GET a single todo by ID
app.get('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // CHANGE HERE: Add a check to ensure 'id' is not undefined before parsing
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id) },
    });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(200).json(todo);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

// UPDATE a todo by ID
app.patch('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }
    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(id) },
      data: { text, completed },
    });
    res.status(200).json(updatedTodo);
  } catch (err) {
    // CHANGE HERE: Safely check for the Prisma error code
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ error: 'Todo not found' });
    }
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE a todo by ID
app.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required' });
    }
    await prisma.todo.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ error: 'Todo not found' });
    }
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});