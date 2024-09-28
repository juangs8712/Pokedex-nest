import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePokemonDto {

    @IsInt(     { message: `'no' debe ser un número`})
    @IsPositive({ message: `'no' debe ser un número positivo`})
    @Min(1,     { message: `'no' debe ser >= que 1`})
    no: string;
    
    @IsString()
    @MinLength(1)
    name: string;
}
