/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
      match.timestamp = { $gte: new Date(startTime).getTime() };
    }
    if (endTime) {
      match.timestamp = {
        ...match.timestamp,
        $lte: new Date(endTime).getTime(),
      };
    }
    //   groupe positions by deviceId and return data format {devicedId: string, positions: Position[]}

    // limit to 20 positions per deviceId

    // const positions = (await this.positionModel
    //   .aggregate([
    //     {
    //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //       $match: match,
    //     },
    //     {
    //       $group: {
    //         _id: '$deviceId',
    //         positions: { $push: '$$ROOT' },
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 0,
    //         deviceId: '$_id',
    //         // positions: 1,
    //         positions: { $slice: ['$positions', 1000] },
    //       },
    //     },
    //   ])
    //   .exec()) as unknown as Promise<
    //   {
    //     deviceId: string;
    //     positions: Position[];
    //   }[]
    // >;
    const positions = (await this.positionModel
      .aggregate([
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          $match: match,
        },
        { $sort: { timestamp: 1 } }, // Sort by timestamp ascending
        {
          $group: {
            _id: {
              deviceId: '$deviceId',
              // Truncate timestamp to minute (assuming milliseconds)
              minute: { $trunc: { $divide: ['$timestamp', 60000] } },
            },
            firstPosition: { $first: '$$ROOT' }, // First doc in each minute
          },
        },
        {
          $group: {
            _id: '$_id.deviceId',
            positions: { $push: '$firstPosition' }, // Collect positions per device
          },
        },
        {
          $project: {
            _id: 0,
            deviceId: '$_id',
            // positions: 1,
            positions: { $slice: ['$positions', 100] }, // Limit to 1000 entries
          },
        },
      ])
      .exec()) as unknown as Promise<
      {
        deviceId: string;
        positions: Position[];
      }[]
    >;

    return positions;
  }

  //findAllTrips
  async findAllTrips(
    deviceIds: string[],
    startTime?: string | Date,
    endTime?: string | Date,
  ): Promise<
    {
      deviceId: string;
      positions: Position[];
    }[]
  > {
    const match: any = {};
    if (deviceIds.length !== 0) {
      match.deviceId = { $in: deviceIds };
    }
    if (startTime) {
      match.timestamp = { $gte: new Date(startTime).getTime() };
    }
    if (endTime) {
      match.timestamp = {
        ...match.timestamp,
        $lte: new Date(endTime).getTime(),
      };
    }
    match.trip = { $in: [0, 1] };
    const positionsWithTrips = (await this.positionModel
      .aggregate([
        { $match: match },
        { $sort: { timestamp: 1 } },
        {
          $group: {
            _id: '$deviceId',
            positions: { $push: '$$ROOT' }, // Push all positions for each device
          },
        },
        {
          $project: {
            _id: 0,
            deviceId: '$_id',
            positions: 1,
          },
        },
      ])
      .exec()) as unknown as Promise<
      {
        deviceId: string;
        positions: Position[];
      }[]
    >;
    return positionsWithTrips;
  }
}
