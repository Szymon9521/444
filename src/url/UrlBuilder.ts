import { UrlList } from './UrlList.js'

export default class UrlBuilder {
    private url: string;

    constructor(front : UrlList, url : string) {
        this.url = front + url;
    }

    public getUrl() {
        return this.url;
    }

    public getEnum() {
        return UrlList;
    }
}