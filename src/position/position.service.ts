import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from './schemas/position.schema';
import { Model } from 'mongoose';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel(Position.name) private positionModel: Model<Position>,
  ) {}

  async getAllPositions(): Promise<Position[]> {
    return this.positionModel.find().exec();
  }

  async getPositionById(id: string): Promise<Position> {
    const position = await this.positionModel.findById(id).exec();
    if (!position) {
      throw new Error(`Position with id ${id} not found`);
    }
    return position;
  }

  // method to get positions by deviceId
  async getPositionsByDeviceId(deviceId: string): Promise<Position[]> {
    return this.positionModel.find({ deviceId }).exec();
  }

  // getLastPositionOfAllDevices
  async getLastPositionOfAllDevices(): Promise<Position[]> {
    return this.positionModel.aggregate([
      {
        $group: {
          _id: '$deviceId',
          lastPosition: { $last: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$lastPosition' },
      },
    ]);
  }

  // getLastPositionByDeviceId
  async getLastPositionByDeviceId(deviceId: string): Promise<Position> {
    const position = await this.positionModel
      .find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();
    if (!position || position.length === 0) {
      throw new Error(`Position with deviceId ${deviceId} not found`);
    }
    return position[0];
  }

  //findLatestPositionsByCriteria( ByDeviceId: string[],startTime?: string | Date,endTime?: string | Date it should return a list of positions)
  async findLatestPositionsByCriteria(
    deviceIds: string[],
    startTime?: string | Date,
    endTime?: string | Date,
  ): Promise<{ deviceId: string; positions: Position[] }[]> {
    const match: any = {
      deviceId: { $in: deviceIds },
    };
    if (startTime) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      match.timestamp = { $gte: new Date(startTime).getTime() };
    }
    if (endTime) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      match.timestamp = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...match.timestamp,
        $lte: new Date(endTime).getTime(),
      };
    }
    //   groupe positions by deviceId and return data format {devicedId: string, positions: Position[]}

    // limit to 20 positions per deviceId

    const positions = (await this.positionModel
      .aggregate([
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          $match: match,
        },
        {
          $group: {
            _id: '$deviceId',
            positions: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            _id: 0,
            deviceId: '$_id',
            // positions: 1,
            positions: { $slice: ['$positions', 1000] },
          },
        },
      ])
      .exec()) as unknown as Promise<
      {
        deviceId: string;
        positions: Position[];
      }[]
    >;
    // get randomly 2o positions by including the first last and the middle position
    // for (const position of await positions) {
    //   const positionsArray = position.positions;
    //   if (positionsArray.length > 20) {
    //     const firstPosition = positionsArray[0];
    //     const lastPosition = positionsArray[positionsArray.length - 1];

    //     // Get middle positions (excluding first and last)
    //     const middlePositions = positionsArray.slice(1, -1);

    //     // Randomly select 18 positions from the middle
    //     const selectedIndices = new Set();
    //     while (selectedIndices.size < Math.min(1, middlePositions.length)) {
    //       const randomIndex = Math.floor(
    //         Math.random() * middlePositions.length,
    //       );
    //       selectedIndices.add(randomIndex);
    //     }

    //     // Get the selected positions and sort by their original indices to maintain order
    //     const randomPositions = Array.from(selectedIndices as Set<number>)
    //       .sort((a: number, b: number) => a - b) // Sort indices to maintain original order
    //       .map((index: number) => middlePositions[index]);

    //     position.positions = [firstPosition, ...randomPositions, lastPosition];
    //   } else {
    //     // If there are less than 20 positions, keep all of them
    //     position.positions = positionsArray;
    //   }
    // }
    return positions;
  }
}
