import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class CreateRelations1590238613926
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      'orders_products',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      'orders_products',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
