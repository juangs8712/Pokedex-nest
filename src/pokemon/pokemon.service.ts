import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
@Injectable()
export class PokemonService {
  // -----------------------------------------------------
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel : Model<Pokemon>
  ){}
  // -----------------------------------------------------
  async create(createPokemonDto: CreatePokemonDto) {
 
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase().trim();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }
  // -----------------------------------------------------
  findAll() {
    return `This action returns all pokemon`;
  }
  // -----------------------------------------------------
  async findOne(term: string) {
    let pokemon : Pokemon;

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if ( !pokemon && isValidObjectId(term) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    if ( ! pokemon ) {
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase()})
    }

    if ( ! pokemon ) 
      throw new NotFoundException(`Pokemon with id, no, name "${ term }" not found`);


    return pokemon;
  }
  // -----------------------------------------------------
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    // no poner esta line dentro del try/catch para que en caso de 
    // fallar la busqueda se devuelva el error correspondiente
    const pokemon = await this.findOne(term);
    
    try {
      if ( updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();
      
      await pokemon.updateOne( updatePokemonDto, );
  
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions( error );
    }
  }
  // -----------------------------------------------------
  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    // pokemon.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id : id });
    if ( deletedCount === 0 ) {
      throw new BadRequestException(`Pokemon with id "${ id }" not found`);
    }
    return { message: `Pokemon with id "${id}" removed successfully` };
  } 
  // -----------------------------------------------------
  private handleExceptions( error : any ){
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue )}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create pokemon - check logs.`);
  }
  // -----------------------------------------------------
}
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
