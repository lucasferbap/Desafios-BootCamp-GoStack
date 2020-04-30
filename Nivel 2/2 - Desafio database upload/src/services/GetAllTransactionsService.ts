import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
// import AppError from '../errors/AppError';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface ResponseGet {
  transactions: Array<Transaction>;
  balance: Balance;
}

class GetAllTransactionsService {
  public async execute(): Promise<ResponseGet> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transactions = await transactionRepository.find();
    const balance = await transactionRepository.getBalance();
    const responseGet: ResponseGet = {
      transactions,
      balance,
    };
    return responseGet;
  }
}

export default GetAllTransactionsService;
