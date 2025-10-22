import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    avatar: { type: String },
    birthday: { type: Date },
    horoscope: { type: String },
    zodiac: { type: String },
    height: { type: Number },
    weight: { type: Number },
    last_login: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
},{ 
	collection: 'users',
	versionKey: false
});

UserSchema.pre('save', async function () {
    try {
        if (!this.isModified('password')) return;
        
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(this['password'], salt);
        this['password'] = hash;
    } catch (error) {
        throw new Error(error);
    }
});