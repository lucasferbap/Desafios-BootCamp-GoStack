import { Router } from 'express';
import multer from 'multer';
import CreateTransactionService from '../services/CreateTransactionService';
import ValidateTransactionService from '../services/ValidadeTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import GetAllTransactionsService from '../services/GetAllTransactionsService';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

interface TransactionResponse {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: {
    id: string;
    title: string;
  };
}

transactionsRouter.get('/', async (request, response) => {
  const getAllTransactionsService = new GetAllTransactionsService();
  return response.json(await getAllTransactionsService.execute());
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await new DeleteTransactionService().execute(id);
  return response.status(204).send();
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  await new ValidateTransactionService().execute({ value, type });
  const transaction = await new CreateTransactionService().execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const filePath = request.file.path;
    const importTransactionsService = new ImportTransactionsService();
    const importedTransactions = await importTransactionsService.execute(
      filePath,
    );
    return response.json(importedTransactions);
  },
);

export default transactionsRouter;
