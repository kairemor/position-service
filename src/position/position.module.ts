import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PositionSchema } from './schemas/position.schema';

@Module({
  imports: [
    // Import any other modules you need here, such as MongooseModule for MongoDB
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  providers: [PositionService],
  controllers: [PositionController],
})
export class PositionModule {}
