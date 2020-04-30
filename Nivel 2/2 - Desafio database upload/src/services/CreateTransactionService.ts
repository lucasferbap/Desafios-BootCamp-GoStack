import { getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoryRepository';

interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransaction): Promise<Transaction> {
    const categoryRepository = getCustomRepository(CategoryRepository);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    let category_obj = await categoryRepository.findCategoryByName(category);

    if (!(category_obj === undefined)) {
      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: category_obj.id,
      });
      await transactionRepository.save(transaction);

      return transaction;
    }
    category_obj = categoryRepository.create({ title: category });
    await categoryRepository.save(category_obj);
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category_obj.id,
      category: category_obj,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
