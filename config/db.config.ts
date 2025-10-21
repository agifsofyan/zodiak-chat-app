import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from '@nestjs/config';

export const CONFIG_DB_CONNECTION = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        const dbUser = config.get<string>('DB_USER') || '';
        const dbPass = config.get<string>('DB_PASS') || '';
        const dbHost = config.get<string>('DB_HOST');
        const dbPort = config.get<number>('DB_PORT');
        const dbName = config.get<string>('DB_NAME');
        const dbAuth = config.get<string>('DB_AUTH') || '';

        let uri = '';

        if (dbUser && dbPass) {
            uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
        } else {
            uri = `mongodb://${dbHost}:${dbPort}/${dbName}`;
        }

        if (dbAuth) {
            uri += `?authSource=${dbAuth}`;
        }

        return { uri };
    },
})
