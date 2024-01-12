import Joi from 'joi';
import JoiPasswordComplexity from 'joi-password-complexity';

export const signUpBodyValidation = (body) => {
    const schema = Joi.object({
        name: Joi.string().required().min(3).max(30).label('Name'),
        mobile: Joi.string().min(10).max(15).required().label('Mobile number'),
        // password: Joi.string().min(6).max(20).alphanum().label('Password'),
        text_status: Joi.string().label('Text Status'),
        email: Joi.string().required().email().label('Email'),
        password: JoiPasswordComplexity().required().label('Password'),

    });
    return schema.validate(body);
}

export const loginValidation = (body) => {
    const schema = Joi.object({
        email: Joi.string().email().label('Email'),
        mobile: Joi.string().min(10).max(15).label('Mobile number'),
        password: Joi.string().required().label('Password'),
    }).xor('email', 'mobile');
    return schema.validate(body);
}

export const searchValidation = (body) => {
    const schema = Joi.object({
        email: Joi.string().email().label('Email'),
        mobile: Joi.string().min(10).max(15).label('Mobile number')
    }).xor('email', 'mobile');
    return schema.validate(body);
}

export const refershTokenValidation = (body) => {
    const schema = Joi.object({
        refreshToken: Joi.string().required().label('Refresh Token'),
    });
    return schema.validate(body);
}
