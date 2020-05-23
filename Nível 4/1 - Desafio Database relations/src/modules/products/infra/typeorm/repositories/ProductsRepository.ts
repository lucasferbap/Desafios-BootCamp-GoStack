import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

// interface IFindProducts {
//   id: string;
// }

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({ where: { name } });
  }

  public async findAllById(products: string[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.findByIds(products);
    if (findProducts.length < products.length) {
      throw new AppError(`Some product not found`);
    }
    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const products_id: string[] = [];
    const products_qtd: number[] = [];
    products.forEach(prod => {
      products_id.push(prod.id);
      products_qtd.push(prod.quantity);
    });
    const findProducts = await this.findAllById(products_id);
    for (let index = 0; index < findProducts.length; index += 1) {
      findProducts[index].quantity -= products_qtd[index];
    }

    await this.ormRepository.save(findProducts);

    return findProducts;
  }
}

export default ProductsRepository;
