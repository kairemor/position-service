import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'sensordatas' })
export class Position extends Document {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  totalOdometer: number;

  @Prop({ required: true })
  gsmSignal: number;

  @Prop({ required: true })
  externalVoltage: number;

  @Prop({ required: true })
  batteryVoltage: number;

  @Prop({ required: true })
  batteryCurrent: number;

  @Prop({ required: true })
  gnssStatus: number;

  @Prop({ required: true })
  gnssPDOP: number;

  @Prop({ required: true })
  gnssHDOP: number;

  @Prop({ required: true })
  sleepMode: number;

  @Prop({ required: true })
  ignition: number;

  @Prop({ required: true })
  movement: number;

  @Prop({ required: true })
  activeGSMOperator: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  gpsPrecision: number;

  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;

  @Prop({ required: true })
  altitude: number;

  @Prop({ required: true })
  angle: number;

  @Prop({ required: true })
  satellites: number;

  @Prop({ required: true })
  speed: number;

  @Prop({ required: true })
  event: number;

  @Prop({ required: false })
  trip: number;

  @Prop({ required: false })
  trip_Odometer_m: number;

  @Prop({ required: false })
  fuel_level_kvants: number;

  @Prop({ required: false })
  fuel_temp_celcius: number;

  @Prop({ required: false })
  device_Timestamp: number;

  @Prop({ required: false })
  GNSS_speed_kmh: number;

  @Prop({ required: false })
  ignition_On_Counter_s: number;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

PositionSchema.index({ deviceId: 1, timestamp: 1 });
PositionSchema.index({ timestamp: 1 });
