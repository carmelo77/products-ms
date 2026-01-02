import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

import { envs } from '../config/envs';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(ProductsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  constructor() {
    const adapter = new PrismaLibSql({
      url: envs.databaseUrl
    });

    super({
      adapter
    });
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count();
    const lastPage = Math.ceil(totalPages / limit);

    const products = await this.product.findMany({
      where: { available: true },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data: products,
      meta: {
        total: totalPages,
        page,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true }
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`)
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.product.update({
      where: { id },
      data: updateProductDto
    })
  }

  async remove(id: number) {
    await this.findOne(id);

    // return await this.product.delete({
    //   where: { id }
    // })

    return await this.product.update({
      where: { id },
      data: { available: false }
    })
  }
}
