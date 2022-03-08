import axios, { AxiosRequestConfig } from 'axios';

export default class Utility {
    public static async request(config: AxiosRequestConfig) {
        return (await axios.create(config).request(config)).data;
    };
}