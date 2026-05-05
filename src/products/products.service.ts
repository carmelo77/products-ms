import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { RpcException } from '@nestjs/microservices';

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
    const { page = 1, limit = 10 } = paginationDto;

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
      throw new RpcException({
        message: `Product ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;

    return await this.product.update({
      where: { id },
      data
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
