import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface SellerProfile {
  shopName: string;
  bio?: string;
  region?: string;
  approved: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isBlocked: boolean;
  blockReason?: string;
  avatarUrl?: string;
  addresses: Address[];
  wishlist: Types.ObjectId[];
  sellerProfile?: SellerProfile;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String },
  },
  { _id: true },
);

const sellerProfileSchema = new Schema<SellerProfile>(
  {
    shopName: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    region: { type: String, trim: true },
    approved: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer', index: true },
    isBlocked: { type: Boolean, default: false, index: true },
    blockReason: { type: String, trim: true },
    avatarUrl: { type: String },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    sellerProfile: { type: sellerProfileSchema },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>('User', userSchema);
