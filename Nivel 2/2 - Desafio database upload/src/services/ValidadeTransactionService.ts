import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface ValidateTransaction {
  value: number;
  type: 'income' | 'outcome';
}

class ValidateTransactionService {
  public async execute({ value, type }: ValidateTransaction): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionRepository.getBalance();
    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('Tu vai ficar devendo rapaz kkkkkkkkkk');
    }
  }
}

export default ValidateTransactionService;
