import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  /**
   * Returns a simple hello world message
   * @returns Hello world string
   */
  getHello(): string {
    return "Hello World!";
  }
}
