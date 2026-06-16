import { ExtractJwt, Strategy } from 'passport-jwt';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { TypedConfigService } from '@common/config/app-config';

import { IJWTAuthPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'registeredUserJWT') {
    constructor(configService: TypedConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_AUTH_SECRET'),
        });
    }

    async validate(JWTPrivatePayload: IJWTAuthPayload): Promise<IJWTAuthPayload> {
        return JWTPrivatePayload;
    }
}
