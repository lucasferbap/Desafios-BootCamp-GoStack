import csvToJson from 'csvtojson';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  public async execute(filePath: string): Promise<Transaction[]> {
    const jsonArray = await csvToJson().fromFile(filePath);
    const transactions: Array<Transaction> = [];
    for (let i = 0; i < jsonArray.length; i += 1) {
      transactions.push(
        await new CreateTransactionService().execute(jsonArray[i]),
      );
    }
    // console.log(transactions);
    return transactions;
  }
}

export default ImportTransactionsService;
