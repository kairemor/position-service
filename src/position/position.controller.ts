import { Controller, Get, Param, Query } from '@nestjs/common';
import { PositionService } from './position.service';

@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  // Example endpoint to get all positions
  @Get()
  async getAllPositions() {
    return this.positionService.getAllPositions();
  }

  // Example endpoint to get positions by deviceId
  @Get('device/:deviceId')
  async getPositionsByDeviceId(@Param('deviceId') deviceId: string) {
    return this.positionService.getPositionsByDeviceId(deviceId);
  }

  // Example endpoint to get the last position of all devices
  @Get('last')
  async getLastPositionOfAllDevices() {
    return this.positionService.getLastPositionOfAllDevices();
  }

  // Example endpoint to find all trips
  @Get('trips')
  async findAllTrips(
    @Query('deviceIds') deviceIds: string,
    @Query('startTime') startTime: Date,
    @Query('endTime') endTime: Date,
  ) {
    // Convert deviceIds from string to array
    const devicesIds = deviceIds
      ? deviceIds.split(',').map((id: string) => id.trim())
      : [];
    // Convert startTime and endTime to Date objects if they are provided
    if (startTime) {
      startTime = new Date(startTime);
    }
    if (endTime) {
      endTime = new Date(endTime);
    }
    return this.positionService.findAllTrips(devicesIds, startTime, endTime);
  }

  // Example endpoint to get the last position by deviceId
  @Get('last/:deviceId')
  async getLastPositionByDeviceId(@Param('deviceId') deviceId: string) {
    return this.positionService.getLastPositionByDeviceId(deviceId);
  }

  // Example endpoint to get the last position by deviceId and time range
  @Get('latest/')
  async findLatestPositionsByCriteria(
    @Query('deviceIds') deviceIds: string,
    @Query('startTime') startTime: Date,
    @Query('endTime') endTime: Date,
  ) {
    // Convert deviceIds from string to array
    const devicesIds = deviceIds.split(',').map((id: string) => id.trim());
    // Convert startTime and endTime to Date objects if they are provided
    if (startTime) {
      startTime = new Date(startTime);
    }
    if (endTime) {
      endTime = new Date(endTime);
    }
    // Call the service method to find the latest positions
    // and return the result
    return await this.positionService.findLatestPositionsByCriteria(
      devicesIds,
      startTime,
      endTime,
    );
  }

  // Example endpoint to get a position by ID
  @Get(':id')
  async getPositionById(@Param('id') id: string) {
    return this.positionService.getPositionById(id);
  }
}
