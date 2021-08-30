import https from "https";

export interface EnvModel {
  port: number;
  auth?: any;
}

export const fill = async (
  port: number,
  openId?: string
): Promise<EnvModel> => {
  const env: EnvModel = { port };
  if (!!openId) {
    try {
      env.auth = await getJson(openId);
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return Promise.resolve(env);
};

const getJson = async (url: string): Promise<any> =>
  new Promise((resolve, reject) =>
    https
      .get(url, (resp) => {
        let data = "";

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          resolve(JSON.parse(data));
        });
      })
      .on("error", (err) => {
        reject(err);
      })
  );
