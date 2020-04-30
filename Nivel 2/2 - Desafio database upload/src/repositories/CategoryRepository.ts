import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async findCategoryByName(name: string): Promise<Category | undefined> {
    const category = await this.findOne({
      where: { title: name },
    });

    return category || undefined;
  }

  // public async findCategoryNameById(id: string): Promise<string>{
  //   return await this.findOneOrFail
  // }
}

export default CategoryRepository;
