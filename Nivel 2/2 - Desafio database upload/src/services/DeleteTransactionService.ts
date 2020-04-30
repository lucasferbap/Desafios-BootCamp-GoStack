// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const removeTransaction = await transactionRepository.findOne(id);
    if (!(removeTransaction === undefined)) {
      await transactionRepository.remove(removeTransaction);
    } else {
      throw new AppError('This Id does not exixts');
    }
  }
}

export default DeleteTransactionService;
