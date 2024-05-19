import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: [true, 'Email already exists'] })
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop({ default: '' })
  company: string;

  @Prop([String])
  addresses: string[];

  @Prop()
  password: string;

  @Prop()
  Token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
