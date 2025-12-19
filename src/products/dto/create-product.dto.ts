import { Type } from "class-transformer";
import { IsString, IsNumber, IsPositive } from "class-validator";

export class CreateProductDto {

    @IsString()
    public name: string;

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @IsPositive()
    @Type(() => Number) // Type transforma lo que recibe a un número
    public price: number;
}
