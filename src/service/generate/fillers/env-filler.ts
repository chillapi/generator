export interface AuthEnvModel {
    domain: string;
    audience: string;
}
export interface EnvModel {
    port: number;
    auth?: AuthEnvModel;
}

export const fill = (port: number, authDomain?: string, authAudience?: string): EnvModel => {
    const env: EnvModel = { port };
    if (!!authDomain && !!authAudience) {
        env.auth = { domain: authDomain, audience: authAudience };
    }
    return env;
}