import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IProductsDTO {
  product_id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Invalid customer!');
    }

    const productsId = products.map(prod => prod.id);

    const orderProducts: IProductsDTO[] = [];

    const findProducts = await this.productsRepository.findAllById(productsId);

    if (!findProducts) {
      throw new AppError('Invalid product!');
    }

    for (let index = 0; index < findProducts.length; index += 1) {
      if (findProducts[index].quantity < products[index].quantity) {
        throw new AppError('Not enough products');
      }

      orderProducts.push({
        price: findProducts[index].price,
        product_id: findProducts[index].id,
        quantity: products[index].quantity,
      });
    }

    await this.productsRepository.updateQuantity(products);

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateProductService;
