import * as redis from "redis";

type GetLocalConfigInterface = <ENV_KEY extends keyof EnvironmentVariables>(configName: ENV_KEY) => EnvironmentVariables[ENV_KEY];

interface EnvironmentVariables {
    REDIS_DATABASE: string;
    REDIS_HOST: string;
    REDIS_PASSWORD: string | undefined;
    REDIS_PORT: string;
    REDIS_SOCKET: string | undefined;
}

const ENVIRONMENT_DEFAULTS: EnvironmentVariables = {
    REDIS_DATABASE: "5",
    REDIS_HOST: "127.0.0.1",
    REDIS_PASSWORD: undefined,
    REDIS_SOCKET: undefined,
    REDIS_PORT: "6379",
};

const getLocalConfig: GetLocalConfigInterface = <ENV_KEY extends keyof EnvironmentVariables>(configName: ENV_KEY) => {
    if (!(configName in ENVIRONMENT_DEFAULTS)) throw new Error(`Unknown local configuration key: ${configName}`);

    const envValue = process.env[configName] as string | undefined;
    const returnValue = typeof envValue === "undefined" ? ENVIRONMENT_DEFAULTS[configName] : (envValue as any);  

    // Change "true" or "false" to boolean values or return value as string instead
    if (returnValue === "true") return true;
    if (returnValue === "false") return false;
    return returnValue as any;
};

  /** Connection information: If redis unix socket is specified, it is preferred.  */
const connectionInfo: any[] = getLocalConfig("REDIS_SOCKET")
? [getLocalConfig("REDIS_SOCKET")]
: [Number(getLocalConfig("REDIS_PORT")), getLocalConfig("REDIS_HOST")];

let redisClient: redis.RedisClient;

// Get redis client
export const getRedisClient = () => {
    if (redisClient) {
        return redisClient;
    }

    const newClient = redis.createClient(...connectionInfo, {
        db: getLocalConfig("REDIS_DATABASE"),
        password: getLocalConfig("REDIS_PASSWORD"),
    });

    // Just log errors in redis instead of shutting down the server.
    newClient.on("error", function(error) {
        console.error(error);
    });

    redisClient = newClient;
    return redisClient;
};

